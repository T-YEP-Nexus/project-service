require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");
const auth = require("./middleware/auth");

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

const projectRoutes = require("./routes/projects/project.js");
const projectRessourcesRoutes = require("./routes/projects/ressource/ressource.js");
const projectMiscRoutes = require("./routes/projects/misc/misc.js");

const projectStudentRoutes = require("./routes/projects-students/project-student.js");
const projectStudentMiscRoutes = require("./routes/projects-students/misc/misc.js");

// Protéger toutes les routes (sauf /api-docs) via middleware d'auth
app.use(auth);

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
