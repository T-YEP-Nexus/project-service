const request = require("supertest");

const BASE_URL = "http://localhost:3003";

let testProjectStudentId = null;
const testStudentId = 49;
const testProjectId = 19;

describe("ProjectStudents Routes (Integration)", () => {
  describe("GET /project-students", () => {
    it("should return all project students", async () => {
      const res = await request(BASE_URL).get("/project-students");
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
        .send(duplicateAssignment);
      expect(res.status).toBe(409);
    });

    it("should return 400 if required fields are missing", async () => {
      const res = await request(BASE_URL).post("/project-students").send({
        advisor_comment: "Missing ids",
      });
      expect(res.status).toBe(400);
    });
  });

  describe("GET /project-students/:id", () => {
    it("should return project assignment by ID", async () => {
      const res = await request(BASE_URL).get(
        `/project-students/${testProjectStudentId}`
      );
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(testProjectStudentId);
    });

    it("should return 404 for non-existent ID", async () => {
      const res = await request(BASE_URL).get("/project-students/999999");
      expect(res.status).toBe(404);
    });
  });

  describe("GET /project-students/student/:id_student", () => {
    it("should return assignments for a student", async () => {
      const res = await request(BASE_URL).get(
        `/project-students/student/${testStudentId}`
      );
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe("GET /project-students/project/:id_project", () => {
    it("should return assignments for a project", async () => {
      const res = await request(BASE_URL).get(
        `/project-students/project/${testProjectId}`
      );
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe("GET /project-students/due-soon/list", () => {
    it("should return assignments due within the next 7 days", async () => {
      const res = await request(BASE_URL).get(
        "/project-students/due-soon/list"
      );
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe("PATCH /project-students/:id", () => {
    it("should update a project assignment successfully", async () => {
      const res = await request(BASE_URL)
        .patch(`/project-students/${testProjectStudentId}`)
        .send({ advisor_comment: "Updated comment" });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should return 400 if no fields provided", async () => {
      const res = await request(BASE_URL)
        .patch(`/project-students/${testProjectStudentId}`)
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
        .send({});
      expect(res.status).toBe(400);
    });
  });

  describe("DELETE /project-students/:id", () => {
    it("should delete a project assignment successfully", async () => {
      const res = await request(BASE_URL).delete(
        `/project-students/${testProjectStudentId}`
      );
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should return 404 when deleting an already deleted assignment", async () => {
      const res = await request(BASE_URL).delete(
        `/project-students/${testProjectStudentId}`
      );
      expect(res.status).toBe(404);
    });
  });
});
