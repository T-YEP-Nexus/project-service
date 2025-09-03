const express = require('express');
const router = express.Router();
const supabase = require('../../config/supabaseClient.js');

/**
 * @swagger
 * tags:
 *   name: ProjectStudents
 *   description: API for managing project-student assignments
 */

// Get all project assignments

/**
 * @swagger
 * /project-students:
 *   get:
 *     summary: Get all project-student assignments
 *     tags: [ProjectStudents]
 *     responses:
 *       200:
 *         description: Project assignments retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/project-students', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('project_student')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching project assignments:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch project assignments',
        error: error.message
      });
    }

    res.status(200).json({
      success: true,
      message: 'Project assignments retrieved successfully',
      data: data,
      count: data.length
    });

  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message
    });
  }
});

// Get a project assignment by id
/**
 * @swagger
 * /project-students/{id}:
 *   get:
 *     summary: Get a specific project assignment by ID
 *     tags: [ProjectStudents]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Project-student assignment ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Project assignment retrieved successfully
 *       404:
 *         description: Assignment not found
 *       500:
 *         description: Server error
 */
router.get('/project-students/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('project_student')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Project assignment not found'
        });
      }

      console.error('Error fetching project assignment:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch project assignment',
        error: error.message
      });
    }

    res.status(200).json({
      success: true,
      message: 'Project assignment retrieved successfully',
      data: data
    });

  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message
    });
  }
});

// Get project assignments by student ID
/**
 * @swagger
 * /project-students/student/{id_student}:
 *   get:
 *     summary: Get all project assignments for a specific student
 *     tags: [ProjectStudents]
 *     parameters:
 *       - name: id_student
 *         in: path
 *         required: true
 *         description: Student ID (UUID)
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Assignments retrieved successfully
 *       400:
 *         description: Student ID is required
 *       404:
 *         description: Student ID not found
 *       500:
 *         description: Server error
 */
router.get('/project-students/student/:id_student', async (req, res) => {
  try {
    const { id_student } = req.params;

    // Validate that student ID is provided
    if (!id_student) {
      return res.status(400).json({
        success: false,
        message: 'Student ID is required'
      });
    }

    const { data, error } = await supabase
      .from('project_student')
      .select('*')
      .eq('id_student', id_student)
      .order('created_at', { ascending: false });

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Student id not found'
        });
      }

      console.error('Error fetching project student by student id:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch project student',
        error: error.message
      });
    }

    res.status(200).json({
      success: true,
      message: 'Project assignments retrieved successfully',
      data: data,
      count: data.length
    });

  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message
    });
  }
});

// Get project assignments by project ID
/**
 * @swagger
 * /project-students/project/{id_project}:
 *   get:
 *     summary: Get all project assignments for a specific project
 *     tags: [ProjectStudents]
 *     parameters:
 *       - name: id_project
 *         in: path
 *         required: true
 *         description: Project ID (UUID)
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Assignments retrieved successfully
 *       400:
 *         description: Project ID is required
 *       500:
 *         description: Server error
 */
router.get('/project-students/project/:id_project', async (req, res) => {
  try {
    const { id_project } = req.params;

    // Validate that project ID is provided
    if (!id_project) {
      return res.status(400).json({
        success: false,
        message: 'Project ID is required'
      });
    }

    const { data, error } = await supabase
      .from('project_student')
      .select('*')
      .eq('id_project', id_project)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching project assignments by project:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch project assignments',
        error: error.message
      });
    }

    res.status(200).json({
      success: true,
      message: 'Project assignments retrieved successfully',
      data: data,
      count: data.length
    });

  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message
    });
  }
});

// Get assignments with upcoming due dates (next 7 days)
/**
 * @swagger
 * /project-students/due-soon/list:
 *   get:
 *     summary: Get project assignments with due dates within the next 7 days
 *     tags: [ProjectStudents]
 *     responses:
 *       200:
 *         description: Assignments retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/project-students/due-soon/list', async (req, res) => {
  try {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const today = new Date();

    const { data, error } = await supabase
      .from('project_student')
      .select('*')
      .gte('due_date', today.toISOString())
      .lte('due_date', nextWeek.toISOString())
      .order('due_date', { ascending: true });

    if (error) {
      console.error('Error fetching assignments due soon:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch assignments due soon',
        error: error.message
      });
    }

    res.status(200).json({
      success: true,
      message: 'Assignments due soon retrieved successfully',
      data: data,
      count: data.length
    });

  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message
    });
  }
});

// Create a new project assignment
/**
 * @swagger
 * /project-students:
 *   post:
 *     summary: Create a new project-student assignment
 *     tags: [ProjectStudents]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_student
 *               - id_project
 *             properties:
 *               id_student:
 *                 type: string
 *               id_project:
 *                 type: string
 *               due_date:
 *                 type: string
 *                 format: date-time
 *               assigned_at:
 *                 type: string
 *                 format: date-time
 *               advisor_comment:
 *                 type: string
 *               score:
 *                 type: number
 *               max_score:
 *                 type: number
 *     responses:
 *       201:
 *         description: Assignment created successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Assignment already exists
 *       500:
 *         description: Server error
 */
router.post('/project-students', async (req, res) => {
  try {
    const { 
      id_student, 
      id_project, 
      due_date, 
      assigned_at, 
      advisor_comment, 
      score, 
      max_score 
    } = req.body;

    // Validation
    if (!id_student || !id_project) {
      return res.status(400).json({
        success: false,
        message: 'Student ID and Project ID are required'
      });
    }

    // Validate dates if provided
    if (due_date && isNaN(Date.parse(due_date))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid due date format'
      });
    }

    if (assigned_at && isNaN(Date.parse(assigned_at))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid assigned date format'
      });
    }

    // Check if assignment already exists for this student-project combination
    const { data: existingAssignment, error: checkError } = await supabase
      .from('project_student')
      .select('id')
      .eq('id_student', id_student)
      .eq('id_project', id_project)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing assignment:', checkError);
      return res.status(500).json({
        success: false,
        message: 'Failed to check existing assignment',
        error: checkError.message
      });
    }

    if (existingAssignment) {
      return res.status(409).json({
        success: false,
        message: 'Assignment already exists for this student-project combination'
      });
    }

    const assignmentData = {
      id_student,
      id_project,
      due_date: due_date || null,
      assigned_at: assigned_at || new Date().toISOString(),
      advisor_comment: advisor_comment ? advisor_comment.trim() : null,
      score: score || null,
      max_score: max_score || null
    };

    const { data, error } = await supabase
      .from('project_student')
      .insert([assignmentData])
      .select()
      .single();

    if (error) {
      console.error('Error creating project assignment:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create project assignment',
        error: error.message
      });
    }

    res.status(201).json({
      success: true,
      message: 'Project assignment created successfully',
      data: data
    });

  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message
    });
  }
});

// Update a project assignment
/**
 * @swagger
 * /project-students/{id}:
 *   patch:
 *     summary: Update a project assignment
 *     tags: [ProjectStudents]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Assignment ID
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               due_date:
 *                 type: string
 *                 format: date-time
 *               assigned_at:
 *                 type: string
 *                 format: date-time
 *               advisor_comment:
 *                 type: string
 *               score:
 *                 type: number
 *               max_score:
 *                 type: number
 *     responses:
 *       200:
 *         description: Assignment updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Assignment not found
 *       500:
 *         description: Server error
 */
router.patch('/project-students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      due_date, 
      assigned_at, 
      advisor_comment, 
      score, 
      max_score 
    } = req.body;

    // Check if at least one field is provided
    if (due_date === undefined && 
        assigned_at === undefined && 
        advisor_comment === undefined && 
        score === undefined && 
        max_score === undefined) {
      return res.status(400).json({
        success: false,
        message: 'At least one field must be provided for update'
      });
    }

    // Check if assignment exists
    const { data: currentAssignment, error: getCurrentError } = await supabase
      .from('project_student')
      .select('*')
      .eq('id', id)
      .single();

    if (getCurrentError) {
      if (getCurrentError.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Project assignment not found'
        });
      }
      console.error('Error fetching current assignment:', getCurrentError);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch current assignment',
        error: getCurrentError.message
      });
    }

    const updateData = {};

    // Validate and prepare updates
    if (due_date !== undefined) {
      if (due_date !== null && isNaN(Date.parse(due_date))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid due date format'
        });
      }
      updateData.due_date = due_date;
    }

    if (assigned_at !== undefined) {
      if (assigned_at !== null && isNaN(Date.parse(assigned_at))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid assigned date format'
        });
      }
      updateData.assigned_at = assigned_at;
    }

    if (advisor_comment !== undefined) {
      updateData.advisor_comment = advisor_comment ? advisor_comment.trim() : null;
    }


    const { data, error } = await supabase
      .from('project_student')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating project assignment:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update project assignment',
        error: error.message
      });
    }

    res.status(200).json({
      success: true,
      message: 'Project assignment updated successfully',
      data: data
    });

  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message
    });
  }
});

// Delete a project assignment
/**
 * @swagger
 * /project-students/{id}:
 *   delete:
 *     summary: Delete a project assignment
 *     tags: [ProjectStudents]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Assignment ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Assignment deleted successfully
 *       404:
 *         description: Assignment not found
 *       500:
 *         description: Server error
 */
router.delete('/project-students/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if assignment exists before deletion
    const { data: existingAssignment, error: checkError } = await supabase
      .from('project_student')
      .select('*')
      .eq('id', id)
      .single();

    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Project assignment not found'
        });
      }

      console.error('Error checking assignment existence:', checkError);
      return res.status(500).json({
        success: false,
        message: 'Failed to check assignment existence',
        error: checkError.message
      });
    }

    const { error } = await supabase
      .from('project_student')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting project assignment:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete project assignment',
        error: error.message
      });
    }

    res.status(200).json({
      success: true,
      message: 'Project assignment deleted successfully',
      data: {
        deletedAssignment: existingAssignment
      }
    });

  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message
    });
  }
});

// Grade a project assignment (specific endpoint for scoring)
/**
 * @swagger
 * /project-students/{id}/grade:
 *   patch:
 *     summary: Grade a project assignment
 *     tags: [ProjectStudents]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Assignment ID
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               score:
 *                 type: number
 *               max_score:
 *                 type: number
 *               advisor_comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Assignment graded successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Assignment not found
 *       500:
 *         description: Server error
 */
router.patch('/project-students/:id/grade', async (req, res) => {
  try {
    const { id } = req.params;
    const { score, max_score, advisor_comment } = req.body;

    // Validation
    if (score === undefined && max_score === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Score or max score must be provided'
      });
    }

    // Check if assignment exists
    const { data: currentAssignment, error: getCurrentError } = await supabase
      .from('project_student')
      .select('*')
      .eq('id', id)
      .single();

    if (getCurrentError) {
      if (getCurrentError.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Project assignment not found'
        });
      }
      console.error('Error fetching current assignment:', getCurrentError);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch current assignment',
        error: getCurrentError.message
      });
    }

    const updateData = {};
    if (score !== undefined) updateData.score = score;
    if (max_score !== undefined) updateData.max_score = max_score;
    if (advisor_comment !== undefined) {
      updateData.advisor_comment = advisor_comment ? advisor_comment.trim() : null;
    }

    const { data, error } = await supabase
      .from('project_student')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error grading project assignment:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to grade project assignment',
        error: error.message
      });
    }

    res.status(200).json({
      success: true,
      message: 'Project assignment graded successfully',
      data: data
    });

  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message
    });
  }
});

module.exports = router;

