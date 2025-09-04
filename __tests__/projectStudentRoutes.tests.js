const request = require("supertest");
const supabase = require("../config/supabaseClient");
const bcrypt = require("bcrypt");

const BASE_URL = "http://localhost:3003";

let testProjectStudentId = null;
const testStudentId = 49;
const testProjectId = 19;
let authToken = null;
let mainTestUserId = null;
let mainTestUserProfileId = null;
let testUserCredentials = null;

// Helper function to create test user and profile
async function createTestUser() {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 15);
  const testUser = {
    email: `testuser${timestamp}_${randomId}@test.com`,
    password: "testpassword123",
  };

  // Hash password
  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash(testUser.password, saltRounds);

  // Create user in database
  const { data: user, error: userError } = await supabase
    .from("user")
    .insert([
      {
        email: testUser.email,
        password: hashedPassword,
      },
    ])
    .select()
    .single();

  if (userError) {
    throw new Error(`Failed to create test user: ${userError.message}`);
  }

  // Create user profile
  const { data: profile, error: profileError } = await supabase
    .from("user-profile")
    .insert([
      {
        id_user: user.id,
        roles_user: "admin",
      },
    ])
    .select()
    .single();

  if (profileError) {
    // Clean up user if profile creation fails
    await supabase.from("user").delete().eq("id", user.id);
    throw new Error(
      `Failed to create test user profile: ${profileError.message}`
    );
  }

  return {
    user,
    profile,
    credentials: testUser,
  };
}

// Helper function to delete test user and profile
async function deleteTestUser(userId, profileId) {
  try {
    if (profileId) {
      const { error: profileError } = await supabase
        .from("user-profile")
        .delete()
        .eq("id", profileId);

      if (profileError) {
        console.error(
          `❌ Failed to delete profile ${profileId}:`,
          profileError
        );
      } else {
        console.log(`✅ Profile ${profileId} deleted successfully`);
      }
    }

    if (userId) {
      const { error: userError } = await supabase
        .from("user")
        .delete()
        .eq("id", userId);

      if (userError) {
        console.error(`❌ Failed to delete user ${userId}:`, userError);
      } else {
        console.log(`✅ User ${userId} deleted successfully`);
      }
    }
  } catch (error) {
    console.error(
      `❌ Error during cleanup for user ${userId}, profile ${profileId}:`,
      error
    );
  }
}

// Helper function to get authentication token from auth service
async function getAuthToken(credentials) {
  const loginResponse = await request("http://localhost:3001")
    .post("/login")
    .send(credentials);

  if (loginResponse.status !== 200) {
    throw new Error(`Failed to get auth token: ${loginResponse.body.message}`);
  }

  return loginResponse.body.data.token;
}

describe("ProjectStudents Routes (Integration)", () => {
  // Setup: Create test user and get authentication token before running tests
  beforeAll(async () => {
    try {
      // Create test user with profile
      const testUserData = await createTestUser();
      mainTestUserId = testUserData.user.id;
      mainTestUserProfileId = testUserData.profile.id;
      testUserCredentials = testUserData.credentials;

      // Get authentication token
      authToken = await getAuthToken(testUserCredentials);
    } catch (error) {
      console.error("Failed to setup test user:", error);
    }
  });

  // Cleanup: Delete test user after all tests are done
  afterAll(async () => {
    try {
      // Delete the main test user
      await deleteTestUser(mainTestUserId, mainTestUserProfileId);
    } catch (error) {
      console.error("Failed to cleanup test user:", error);
    }
  });

  describe("Authentication Tests", () => {
    it("should reject requests without token", async () => {
      const response = await request(BASE_URL).get("/project-students");
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Unauthorized");
    });

    it("should reject requests with invalid token", async () => {
      const response = await request(BASE_URL)
        .get("/project-students")
        .set("Authorization", "Bearer invalid-token");
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Unauthorized");
    });

    it("should accept requests with valid token", async () => {
      const response = await request(BASE_URL)
        .get("/project-students")
        .set("Authorization", `Bearer ${authToken}`);
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe("GET /project-students", () => {
    it("should return all project students", async () => {
      const res = await request(BASE_URL)
        .get("/project-students")
        .set("Authorization", `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe("POST /project-students", () => {
    it("should create a project assignment successfully", async () => {
      const newAssignment = {
        id_student: testStudentId,
        id_project: testProjectId,
        due_date: "2025-08-31T08:14:26Z",
        assigned_at: "2025-07-08T08:14:26Z",
        advisor_comment: "Initial comment",
        score: [
          {
            bool: false,
            desc: "Créer votre premier commit sur le projet",
            name: "Premier Pas",
          },
          {
            bool: false,
            desc: "Concevoir et implémenter l'architecture principale du système",
            name: "Architecte",
          },
        ],
        max_score: 100,
      };
      const res = await request(BASE_URL)
        .post("/project-students")
        .set("Authorization", `Bearer ${authToken}`)
        .send(newAssignment);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id_student).toBe(testStudentId);

      testProjectStudentId = res.body.data.id;
    });

    it("should return 409 if assignment already exists", async () => {
      const duplicateAssignment = {
        id_student: testStudentId,
        id_project: testProjectId,
      };
      const res = await request(BASE_URL)
        .post("/project-students")
        .set("Authorization", `Bearer ${authToken}`)
        .send(duplicateAssignment);
      expect(res.status).toBe(409);
    });

    it("should return 400 if required fields are missing", async () => {
      const res = await request(BASE_URL)
        .post("/project-students")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          advisor_comment: "Missing ids",
        });
      expect(res.status).toBe(400);
    });
  });

  describe("GET /project-students/:id", () => {
    it("should return project assignment by ID", async () => {
      const res = await request(BASE_URL)
        .get(`/project-students/${testProjectStudentId}`)
        .set("Authorization", `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(testProjectStudentId);
    });

    it("should return 404 for non-existent ID", async () => {
      const res = await request(BASE_URL)
        .get("/project-students/999999")
        .set("Authorization", `Bearer ${authToken}`);
      expect(res.status).toBe(404);
    });
  });

  describe("GET /project-students/student/:id_student", () => {
    it("should return assignments for a student", async () => {
      const res = await request(BASE_URL)
        .get(`/project-students/student/${testStudentId}`)
        .set("Authorization", `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe("GET /project-students/project/:id_project", () => {
    it("should return assignments for a project", async () => {
      const res = await request(BASE_URL)
        .get(`/project-students/project/${testProjectId}`)
        .set("Authorization", `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe("GET /project-students/due-soon/list", () => {
    it("should return assignments due within the next 7 days", async () => {
      const res = await request(BASE_URL)
        .get("/project-students/due-soon/list")
        .set("Authorization", `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe("PATCH /project-students/:id", () => {
    it("should update a project assignment successfully", async () => {
      const res = await request(BASE_URL)
        .patch(`/project-students/${testProjectStudentId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ advisor_comment: "Updated comment" });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should return 400 if no fields provided", async () => {
      const res = await request(BASE_URL)
        .patch(`/project-students/${testProjectStudentId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({});
      expect(res.status).toBe(400);
    });
  });

  describe("PATCH /project-students/:id/grade", () => {
    it("should grade a project assignment successfully", async () => {
      const expectedScore = [
        {
          bool: true,
          desc: "Créer votre premier commit sur le projet",
          name: "Premier Pas",
        },
        {
          bool: true,
          desc: "Concevoir et implémenter l'architecture principale du système",
          name: "Architecte",
        },
      ];

      const res = await request(BASE_URL)
        .patch(`/project-students/${testProjectStudentId}/grade`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          score: expectedScore,
          max_score: 100,
          advisor_comment: "Excellent work",
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.score).toStrictEqual(expectedScore); // ✅ deep equality
    });

    it("should return 400 if neither score nor max_score is provided", async () => {
      const res = await request(BASE_URL)
        .patch(`/project-students/${testProjectStudentId}/grade`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({});
      expect(res.status).toBe(400);
    });
  });

  describe("DELETE /project-students/:id", () => {
    it("should delete a project assignment successfully", async () => {
      const res = await request(BASE_URL)
        .delete(`/project-students/${testProjectStudentId}`)
        .set("Authorization", `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should return 404 when deleting an already deleted assignment", async () => {
      const res = await request(BASE_URL)
        .delete(`/project-students/${testProjectStudentId}`)
        .set("Authorization", `Bearer ${authToken}`);
      expect(res.status).toBe(404);
    });
  });
});
