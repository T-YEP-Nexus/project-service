const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Project API',
      version: '1.0.0',
      description: 'API for managing projects and student registrations to specific projects',
    },
    servers: [
      {
        url: 'http://localhost:3003',
      },
    ],
  },
  apis: ['./src/routes/*.js', './src/routes/projects/**/*.js', './src/routes/projects-students/**/*.js'],
  

};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;