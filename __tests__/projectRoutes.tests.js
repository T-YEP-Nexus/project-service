const request = require('supertest');

const BASE_URL = 'http://localhost:3003';

let testProjectId = null;

describe('Project CRUD Routes (Integration)', () => {
    describe('GET /projects - Get all projects', () => {
        it('should return all projects successfully', async () => {
            const response = await request(BASE_URL).get('/projects');
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
        });
    });

    describe('GET /projects/:id - Get projects by ID', () => {
        const validID = 1;
        it('should return project by valid ID', async () => {
        const response = await request(BASE_URL).get(`/projects/${validID}`);
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.id).toBe(validID);
        });

        it('should return 404 for non-existent project-students', async () => {
        const response = await request(BASE_URL).get('/projects/60000000000');
        expect(response.status).toBe(404);
        });
    });

    describe('POST /projects - Create new project', () => {
        it('should create project successfully', async () => {
            const newProject = {
                name: 'DevOps Dan',
                description: 'show your best devops skills',
                ressources: ["{\"url\":\"https://example.com/doc1.pdf\",\"filename\":\"doc1.pdf\"}","{\"url\":\"https://example.com/doc2.pdf\",\"filename\":\"doc2.pdf\"}"],
                is_active: 'TRUE',
                id_creator: '94232ec2-047e-4e1e-a120-875b8340aae6'
            };
            const response = await request(BASE_URL).post('/projects').send(newProject);
            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.name).toBe(newProject.name);
            testProjectId = response.body.data.id;
        });

        it('should return 409 for existing project', async () => {
            const response = await request(BASE_URL).post('/projects').send({ 
                name: 'DevOps Dan',
                description: 'show your best devops skills',
                ressources: ["{\"url\":\"https://example.com/doc1.pdf\",\"filename\":\"doc1.pdf\"}","{\"url\":\"https://example.com/doc2.pdf\",\"filename\":\"doc2.pdf\"}"],
                is_active: 'TRUE',
                id_creator: '94232ec2-047e-4e1e-a120-875b8340aae6'
            });
            expect(response.status).toBe(409);
        });

        it('should return 400 for missing fields', async () => {
            const response = await request(BASE_URL).post('/projects').send({
                name: 'DevOps Dan',
                description: 'show your best devops skills'
            });
            expect(response.status).toBe(400);
        });
    });

    describe('PATCH /projects/:id - Update project', () => {
        it('should update the project successfully', async () => {
            expect(testProjectId).toBeTruthy();
            const response = await request(BASE_URL)
                .patch(`/projects/${testProjectId}`)
                .send({ 
                    description: 'do your worst'
                });
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        it('should return 400 for no update fields', async () => {
            const response = await request(BASE_URL)
                .patch(`/projects/${testProjectId}`)
                .send({});
            expect(response.status).toBe(400);
        });
    });

    describe('DELETE /projects/:id - Delete project', () => {
        it('should delete project successfully', async () => {
            expect(testProjectId).toBeTruthy();
            const response = await request(BASE_URL).delete(`/projects/${testProjectId}`);
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        it('should return 404 for already deleted project', async () => {
            const response = await request(BASE_URL).delete(`/projects/${testProjectId}`);
            expect(response.status).toBe(404);
        });
    });
});
