const request = require('supertest');

const BASE_URL = 'http://localhost:3003';

let testProjectStudentId = null;

describe('Student project CRUD Routes (Integration)', () => {
    describe('GET /project-students - Get all project students', () => {
        it('should return all project students successfully', async () => {
        const response = await request(BASE_URL).get('/project-students');
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
        });
    });

    describe('GET /project-students/:id - Get project-students by ID', () => {
        const validID = 1;

        it('should return student project by valid ID', async () => {
        const response = await request(BASE_URL).get(`/project-students/${validID}`);
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.id).toBe(validID);
        });

        it('should return 404 for non-existent project-students', async () => {
        const response = await request(BASE_URL).get('/project-students/60000000000');
        expect(response.status).toBe(404);
        });
    });

    describe('POST /project-students - Create new project student', () => {
        it('should create student project successfully', async () => {
            const newProjectStudent = {
                id_student: '412c4eea-4872-49d1-985d-4168ae41377c',
                id_project: 1,
                due_date: '2025-08-31 08:14:26+00',
                assigned_at: '2025-07-08 08:14:26+00',
                advisor_comment: 'comment of an advisor',
                score: 76,
                max_score: 100
            };
            const response = await request(BASE_URL).post('/project-students').send(newProjectStudent);
            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.id_student).toBe(newProjectStudent.id_student);

            testProjectStudentId = response.body.data.id;
        });

        it('should return 409 for existing student project', async () => {
            const response = await request(BASE_URL).post('/project-students').send({ 
                id_student: '412c4eea-4872-49d1-985d-4168ae41377c',
                id_project: 1,
                due_date: '2025-08-31 08:14:26+00',
                assigned_at: '2025-07-08 08:14:26+00',
                advisor_comment: 'comment of an advisor',
                score: 76,
                max_score: 100
            });
            expect(response.status).toBe(409);
        });

        it('should return 400 for missing fields', async () => {
            const response = await request(BASE_URL).post('/project-students').send({
                advisor_comment: 'comment of an advisor',
                score: 76,
                max_score: 100
            });
            expect(response.status).toBe(400);
        });
    });

    describe('PATCH /project-students/:id - Update student project', () => {
        it('should update the student project successfully', async () => {
            expect(testProjectStudentId).toBeTruthy();
            const response = await request(BASE_URL)
                .patch(`/project-students/${testProjectStudentId}`)
                .send({ 
                    score: 86
                });
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        it('should return 400 for no update fields', async () => {
            const response = await request(BASE_URL)
                .patch(`/project-students/${testProjectStudentId}`)
                .send({});
            expect(response.status).toBe(400);
        });
    });

    describe('DELETE /project-students/:id - Delete student project', () => {
        it('should delete student project successfully', async () => {
            expect(testProjectStudentId).toBeTruthy();
            const response = await request(BASE_URL).delete(`/project-students/${testProjectStudentId}`);
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        it('should return 404 for already deleted student project', async () => {
            const response = await request(BASE_URL).delete(`/project-students/${testProjectStudentId}`);
            expect(response.status).toBe(404);
        });
    });
});
