const request = require("supertest");

const BASE_URL = "http://localhost:3003";

let testProjectId = null;
let testCreatorId = "d73f23af-712a-46cb-8724-7ad47639fb6a";
let testPromotionId = "388bf596-6be5-4fee-b227-38bab0d5ed4a";

describe("Project Routes (Integration)", () => {
  describe("GET /projects - All projects", () => {
    it("should return all projects", async () => {
      const res = await request(BASE_URL).get("/projects");
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
      const res = await request(BASE_URL).post("/projects").send(newProject);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      testProjectId = res.body.data.id;
    });

    it("should fail with 400 if required fields are missing", async () => {
      const res = await request(BASE_URL)
        .post("/projects")
        .send({ name: "BadProject" });
      expect(res.status).toBe(400);
    });
  });

  describe("GET /projects/:id - Single project", () => {
    it("should return a project by ID", async () => {
      const res = await request(BASE_URL).get(`/projects/${testProjectId}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should return 404 for non-existent project", async () => {
      const res = await request(BASE_URL).get("/projects/60000000");
      expect(res.status).toBe(404);
    });
  });

  describe("GET /projects/creator/:id_creator", () => {
    it("should return projects for a creator", async () => {
      const res = await request(BASE_URL).get(
        `/projects/creator/${testCreatorId}`
      );
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe("GET /projects/promotion/:id_promotion", () => {
    it("should return projects for a promotion", async () => {
      const res = await request(BASE_URL).get(
        `/projects/promotion/${testPromotionId}`
      );
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should return 400 for invalid promotion ID format", async () => {
      const res = await request(BASE_URL).get("/projects/promotion/invalid-id");
      expect(res.status).toBe(400);
    });
  });

  describe("GET /projects/active/list", () => {
    it("should return active projects", async () => {
      const res = await request(BASE_URL).get("/projects/active/list");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe("PATCH /projects/:id - Update project", () => {
    it("should update project successfully", async () => {
      const res = await request(BASE_URL)
        .patch(`/projects/${testProjectId}`)
        .send({ description: "Updated project description" });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should return 400 if no fields provided", async () => {
      const res = await request(BASE_URL)
        .patch(`/projects/${testProjectId}`)
        .send({});
      expect(res.status).toBe(400);
    });
  });

  describe("Resources Management", () => {
    it("should add a resource to the project", async () => {
      const res = await request(BASE_URL)
        .post(`/projects/${testProjectId}/resources`)
        .send({ filename: "extra.pdf", url: "https://example.com/extra.pdf" });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it("should get project resources", async () => {
      const res = await request(BASE_URL).get(
        `/projects/${testProjectId}/resources`
      );
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe("PATCH /projects/:id/toggle-active", () => {
    it("should toggle project active status", async () => {
      const res = await request(BASE_URL).patch(
        `/projects/${testProjectId}/toggle-active`
      );
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe("DELETE /projects/:id", () => {
    it("should delete the project successfully", async () => {
      const res = await request(BASE_URL).delete(`/projects/${testProjectId}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should return 404 when deleting an already deleted project", async () => {
      const res = await request(BASE_URL).delete(`/projects/${testProjectId}`);
      expect(res.status).toBe(404);
    });
  });
});
