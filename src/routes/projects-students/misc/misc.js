const express = require('express');
const router = express.Router();
const supabase = require('../../../../config/supabaseClient.js');

/**
 * @swagger
 * tags:
 *   name: ProjectStudents/Misc
 *   description: API for managing project-student misc assignments
 */


// Get project assignments by student ID $
/**
 * @swagger
 * /project-students/student/{id_student}:
 *   get:
 *     summary: Get all project assignments for a specific student
 *     tags: [ProjectStudents/Misc]
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

// Get project assignments by project ID $
/**
 * @swagger
 * /project-students/project/{id_project}:
 *   get:
 *     summary: Get all project assignments for a specific project
 *     tags: [ProjectStudents/Misc]
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

// Get assignments with upcoming due dates (next 7 days) $
/**
 * @swagger
 * /project-students/due-soon/list:
 *   get:
 *     summary: Get project assignments with due dates within the next 7 days
 *     tags: [ProjectStudents/Misc]
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

// Grade a project assignment (specific endpoint for scoring) $
/**
 * @swagger
 * /project-students/{id}/grade:
 *   patch:
 *     summary: Grade a project assignment
 *     tags: [ProjectStudents/Misc]
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
