// CRUD routes for the 'project_student' table

const express = require('express');
const router = express.Router();
const supabase = require('../../config/supabaseClient.js');


// Get all project assignments
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
router.get('/project-students/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!id || !uuidRegex.test(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project assignment ID provided'
      });
    }

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
router.get('/project-students/student/:id_student', async (req, res) => {
  try {
    const { id_student } = req.params;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!id_student || !uuidRegex.test(id_student)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID provided'
      });
    }

    const { data, error } = await supabase
      .from('project_student')
      .select('*')
      .eq('id_student', id_student)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching project assignments by student:', error);
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

// Get project assignments by project ID
router.get('/project-students/project/:id_project', async (req, res) => {
  try {
    const { id_project } = req.params;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!id_project || !uuidRegex.test(id_project)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID provided'
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

    // Validate UUID formats
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id_student)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID format'
      });
    }

    if (!uuidRegex.test(id_project)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID format'
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

    // Validate scores if provided
    if (score !== undefined && (typeof score !== 'number' || score < 0)) {
      return res.status(400).json({
        success: false,
        message: 'Score must be a non-negative number'
      });
    }

    if (max_score !== undefined && (typeof max_score !== 'number' || max_score <= 0)) {
      return res.status(400).json({
        success: false,
        message: 'Max score must be a positive number'
      });
    }

    if (score !== undefined && max_score !== undefined && score > max_score) {
      return res.status(400).json({
        success: false,
        message: 'Score cannot be greater than max score'
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

    // Validate assignment ID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!id || !uuidRegex.test(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid assignment ID provided'
      });
    }

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

    if (score !== undefined) {
      if (score !== null && (typeof score !== 'number' || score < 0)) {
        return res.status(400).json({
          success: false,
          message: 'Score must be a non-negative number'
        });
      }
      updateData.score = score;
    }

    if (max_score !== undefined) {
      if (max_score !== null && (typeof max_score !== 'number' || max_score <= 0)) {
        return res.status(400).json({
          success: false,
          message: 'Max score must be a positive number'
        });
      }
      updateData.max_score = max_score;
    }

    // Validate score against max_score
    const finalScore = score !== undefined ? score : currentAssignment.score;
    const finalMaxScore = max_score !== undefined ? max_score : currentAssignment.max_score;
    
    if (finalScore !== null && finalMaxScore !== null && finalScore > finalMaxScore) {
      return res.status(400).json({
        success: false,
        message: 'Score cannot be greater than max score'
      });
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
router.delete('/project-students/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Validate assignment ID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!id || !uuidRegex.test(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid assignment ID provided'
      });
    }

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
router.patch('/project-students/:id/grade', async (req, res) => {
  try {
    const { id } = req.params;
    const { score, max_score, advisor_comment } = req.body;

    // Validate assignment ID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!id || !uuidRegex.test(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid assignment ID provided'
      });
    }

    // Validation
    if (score === undefined && max_score === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Score or max score must be provided'
      });
    }

    if (score !== undefined && (typeof score !== 'number' || score < 0)) {
      return res.status(400).json({
        success: false,
        message: 'Score must be a non-negative number'
      });
    }

    if (max_score !== undefined && (typeof max_score !== 'number' || max_score <= 0)) {
      return res.status(400).json({
        success: false,
        message: 'Max score must be a positive number'
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

    // Validate score against max_score
    const finalScore = score !== undefined ? score : currentAssignment.score;
    const finalMaxScore = max_score !== undefined ? max_score : currentAssignment.max_score;
    
    if (finalScore !== null && finalMaxScore !== null && finalScore > finalMaxScore) {
      return res.status(400).json({
        success: false,
        message: 'Score cannot be greater than max score'
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

