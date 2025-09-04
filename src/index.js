require("dotenv").config();
const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());

const projectRoutes = require("./routes/projects/project.js");
const projectRessourcesRoutes = require("./routes/projects/ressource/ressource.js");
const projectMiscRoutes = require("./routes/projects/misc/misc.js");

const projectStudentRoutes = require("./routes/projects-students/project-student.js");
const projectStudentMiscRoutes = require("./routes/projects-students/misc/misc.js");

app.use("", projectRoutes);
app.use("", projectRessourcesRoutes);
app.use("", projectMiscRoutes);

app.use("", projectStudentRoutes);
app.use("", projectStudentMiscRoutes);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`Serveur démarré et à l'écoute sur le port ${PORT}`);
});
