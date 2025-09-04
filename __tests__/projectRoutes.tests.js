const request = require("supertest");
const supabase = require("../config/supabaseClient");
const bcrypt = require("bcrypt");

const BASE_URL = "http://localhost:3003";

let testProjectId = null;
let testCreatorId = "d73f23af-712a-46cb-8724-7ad47639fb6a";
let testPromotionId = "388bf596-6be5-4fee-b227-38bab0d5ed4a";
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

describe("Project Routes (Integration)", () => {
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
      const response = await request(BASE_URL).get("/projects");
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Unauthorized");
    });

    it("should reject requests with invalid token", async () => {
      const response = await request(BASE_URL)
        .get("/projects")
        .set("Authorization", "Bearer invalid-token");
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Unauthorized");
    });

    it("should accept requests with valid token", async () => {
      const response = await request(BASE_URL)
        .get("/projects")
        .set("Authorization", `Bearer ${authToken}`);
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe("GET /projects - All projects", () => {
    it("should return all projects", async () => {
      const res = await request(BASE_URL)
        .get("/projects")
        .set("Authorization", `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe("POST /projects - Create project", () => {
    it("should create a project successfully", async () => {
      const newProject = {
        name: `Project-${Date.now()}`,
        description: "This is a valid project description",
        ressources: [
          { url: "https://example.com/doc.pdf", filename: "doc.pdf" },
        ],
        is_active: true,
        id_creator: testCreatorId,
        id_promotion: testPromotionId,
      };
      const res = await request(BASE_URL)
        .post("/projects")
        .set("Authorization", `Bearer ${authToken}`)
        .send(newProject);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      testProjectId = res.body.data.id;
    });

    it("should fail with 400 if required fields are missing", async () => {
      const res = await request(BASE_URL)
        .post("/projects")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ name: "BadProject" });
      expect(res.status).toBe(400);
    });
  });

  describe("GET /projects/:id - Single project", () => {
    it("should return a project by ID", async () => {
      const res = await request(BASE_URL)
        .get(`/projects/${testProjectId}`)
        .set("Authorization", `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should return 404 for non-existent project", async () => {
      const res = await request(BASE_URL)
        .get("/projects/60000000")
        .set("Authorization", `Bearer ${authToken}`);
      expect(res.status).toBe(404);
    });
  });

  describe("GET /projects/creator/:id_creator", () => {
    it("should return projects for a creator", async () => {
      const res = await request(BASE_URL)
        .get(`/projects/creator/${testCreatorId}`)
        .set("Authorization", `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe("GET /projects/promotion/:id_promotion", () => {
    it("should return projects for a promotion", async () => {
      const res = await request(BASE_URL)
        .get(`/projects/promotion/${testPromotionId}`)
        .set("Authorization", `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should return 400 for invalid promotion ID format", async () => {
      const res = await request(BASE_URL)
        .get("/projects/promotion/invalid-id")
        .set("Authorization", `Bearer ${authToken}`);
      expect(res.status).toBe(400);
    });
  });

  describe("GET /projects/active/list", () => {
    it("should return active projects", async () => {
      const res = await request(BASE_URL)
        .get("/projects/active/list")
        .set("Authorization", `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe("PATCH /projects/:id - Update project", () => {
    it("should update project successfully", async () => {
      const res = await request(BASE_URL)
        .patch(`/projects/${testProjectId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ description: "Updated project description" });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should return 400 if no fields provided", async () => {
      const res = await request(BASE_URL)
        .patch(`/projects/${testProjectId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({});
      expect(res.status).toBe(400);
    });
  });

  describe("Resources Management", () => {
    it("should add a resource to the project", async () => {
      const res = await request(BASE_URL)
        .post(`/projects/${testProjectId}/resources`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ filename: "extra.pdf", url: "https://example.com/extra.pdf" });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it("should get project resources", async () => {
      const res = await request(BASE_URL)
        .get(`/projects/${testProjectId}/resources`)
        .set("Authorization", `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe("PATCH /projects/:id/toggle-active", () => {
    it("should toggle project active status", async () => {
      const res = await request(BASE_URL)
        .patch(`/projects/${testProjectId}/toggle-active`)
        .set("Authorization", `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe("DELETE /projects/:id", () => {
    it("should delete the project successfully", async () => {
      const res = await request(BASE_URL)
        .delete(`/projects/${testProjectId}`)
        .set("Authorization", `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should return 404 when deleting an already deleted project", async () => {
      const res = await request(BASE_URL)
        .delete(`/projects/${testProjectId}`)
        .set("Authorization", `Bearer ${authToken}`);
      expect(res.status).toBe(404);
    });
  });
});
