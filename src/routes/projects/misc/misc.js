const express = require('express');
const router = express.Router();
const supabase = require('../../../../config/supabaseClient.js');


/**
 * @swagger
 * tags:
 *   name: Project/Misc
 *   description: Project Misc management endpoints
 */

// Get projects by creator ID $
/**
 * @swagger
 * /projects/creator/{id_creator}:
 *   get:
 *     summary: Get projects by creator ID
 *     tags: [Project/Misc]
 *     parameters:
 *       - name: id_creator
 *         in: path
 *         required: true
 *         description: Creator ID (UUID)
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Projects retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/projects/creator/:id_creator', async (req, res) => {
  try {
    const { id_creator } = req.params;

    // Validate that creator ID is provided
    if (!id_creator) {
      return res.status(400).json({
        success: false,
        message: 'Creator ID is required'
      });
    }

    const { data, error } = await supabase
      .from('project')
      .select('*')
      .eq('id_creator', id_creator)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects by creator:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch projects',
        error: error.message
      });
    }

    res.status(200).json({
      success: true,
      message: 'Projects retrieved successfully',
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

// Get projects by promotion ID $
/**
 * @swagger
 * /projects/creator/{id_creator}:
 *   get:
 *     summary: Get project by promotion ID
 *     tags: [Project/Misc]
 *     parameters:
 *       - name: id_promotion
 *         in: path
 *         required: true
 *         description: promotion ID (UUID)
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: promotion retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/projects/promotion/:id_promotion', async (req, res) => {
  try {
    const { id_promotion } = req.params;

    // Validate that promotion ID is provided
    if (!id_promotion) {
      return res.status(400).json({
        success: false,
        message: 'Promotion ID is required'
      });
    }

    // Validate promotion ID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id_promotion)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid promotion ID format'
      });
    }

    const { data, error } = await supabase
      .from('project')
      .select('*')
      .eq('id_promotion', id_promotion)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects by promotion:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch projects',
        error: error.message
      });
    }

    res.status(200).json({
      success: true,
      message: 'Projects retrieved successfully',
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

// Get active projects only $
/**
 * @swagger
 * /projects/active/list:
 *   get:
 *     summary: Get all active projects
 *     tags: [Project/Misc]
 *     responses:
 *       200:
 *         description: Active projects retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/projects/active/list', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('project')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching active projects:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch active projects',
        error: error.message
      });
    }

    res.status(200).json({
      success: true,
      message: 'Active projects retrieved successfully',
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
// Put a projet to inactive $
/**
 * @swagger
 * /projects/{id}/toggle-active:
 *   patch:
 *     summary: Toggle project active status
 *     tags: [Project/Misc]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Project ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Project status toggled
 *       404:
 *         description: Project not found
 *       500:
 *         description: Server error
 */
router.patch('/projects/:id/toggle-active', async (req, res) => {
  try {
    const { id } = req.params;


    // Get current project status
    const { data: currentProject, error: getCurrentError } = await supabase
      .from('project')
      .select('is_active')
      .eq('id', id)
      .single();

    if (getCurrentError) {
      if (getCurrentError.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        });
      }
      console.error('Error fetching current project:', getCurrentError);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch current project',
        error: getCurrentError.message
      });
    }

    // Toggle the active status
    const newActiveStatus = !currentProject.is_active;

    const { data, error } = await supabase
      .from('project')
      .update({ is_active: newActiveStatus })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error toggling project status:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to toggle project status',
        error: error.message
      });
    }

    res.status(200).json({
      success: true,
      message: `Project ${newActiveStatus ? 'activated' : 'deactivated'} successfully`,
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
