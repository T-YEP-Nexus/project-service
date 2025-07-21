# Projects Microservice

This microservice manages projects and their associated students. It provides routes for creating, reading, updating, deleting, and filtering projects, as well as assigning students to projects and managing resources.

---

## API Routes

### Project Routes

| Method | Endpoint                           | Description                                     |
|--------|------------------------------------|-------------------------------------------------|
| GET    | `/projects`                        | Get all projects                                |
| GET    | `/projects/:id`                    | Get project by ID                               |
| GET    | `/projects/creator/:id_creator`    | Get projects by creator ID                      |
| GET    | `/projects/status/:status`         | Get projects by status (e.g., active/inactive)  |
| POST   | `/projects`                        | Create a new project                            |
| PATCH  | `/projects/:id`                    | Update project details                          |
| PATCH  | `/projects/toggle/:id`             | Toggle project activity status                  |
| DELETE | `/projects/:id`                    | Delete a project                                |
| POST   | `/projects/resource/:id`           | Upload a PDF file as a project resource         |
| GET    | `/projects/resource/:id`           | Get a project's resource (PDF file)             |

---

### Project-Student Routes

| Method | Endpoint                                   | Description                                         |
|--------|--------------------------------------------|-----------------------------------------------------|
| GET    | `/project-students`                        | Get all project-student associations                |
| GET    | `/project-students/project/:id_project`    | Get students for a specific project                 |
| GET    | `/project-students/student/:id_student`    | Get projects for a specific student                 |
| POST   | `/project-students`                        | Assign a student to a project                       |
| PATCH  | `/project-students/:id`                    | Update a project-student association                |
| DELETE | `/project-students/:id`                    | Remove a student from a project                     |

---

## API Description

- **Projects**: 
  - Full lifecycle of a project, with attributes such as title, status, deadline, resource (PDF), and creator ID.
  - Toggle route changes `is_active` status to quickly enable/disable visibility.
  - PDF upload is managed through a dedicated resource route.
  - Filtering is available by creator or status.

- **Project-Students**:
  - Many-to-many relationship between students and projects.
  - Prevents duplicate student-project entries.
  - Supports CRUD operations and filtering by project or student.

---

## Swagger Documentation

Access the full API documentation:

**[Projects Microservice Swagger Documentation](http://localhost:3003/api-docs)**
