const express = require('express');
const router = express.Router();
const supabase = require('../../../../config/supabaseClient.js');

/**
 * @swagger
 * tags:
 *   name: Project/Ressources
 *   description: Project ressources management endpoints
 */

// Get project resources (PDF files) $
/**
 * @swagger
 * /projects/{id}/resources:
 *   get:
 *     summary: Get project resources
 *     tags: [Project/Ressources]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Project ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Project resources retrieved successfully
 *       404:
 *         description: Project not found
 *       500:
 *         description: Server error
 */
router.get('/projects/:id/resources', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('project')
      .select('ressources, name')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        });
      }

      console.error('Error fetching project resources:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch project resources',
        error: error.message
      });
    }

    res.status(200).json({
      success: true,
      message: 'Project resources retrieved successfully',
      data: {
        project_name: data.name,
        resources: data.ressources || [],
        resources_count: data.ressources ? data.ressources.length : 0
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

// Add a resource to a project $
/**
 * @swagger
 * /projects/{id}/resources:
 *   post:
 *     summary: Add a resource to a project
 *     tags: [Project/Ressources]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Project ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - filename
 *               - url
 *             properties:
 *               filename:
 *                 type: string
 *               url:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Resource added successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Resource already exists
 *       500:
 *         description: Server error
 */
router.post('/projects/:id/resources', async (req, res) => {
  try {
    const { id } = req.params;
    const { filename, url, description } = req.body;

    // Validate resource data
    if (!filename || !url) {
      return res.status(400).json({
        success: false,
        message: 'Filename and URL are required'
      });
    }

    if (!filename.toLowerCase().endsWith('.pdf')) {
      return res.status(400).json({
        success: false,
        message: 'Only PDF files are allowed'
      });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid URL format'
      });
    }

    // Get current project
    const { data: currentProject, error: getCurrentError } = await supabase
      .from('project')
      .select('ressources')
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

    const currentResources = currentProject.ressources || [];
    
    // Check if filename already exists
    const existingResource = currentResources.find(r => r.filename === filename);
    if (existingResource) {
      return res.status(409).json({
        success: false,
        message: 'A resource with this filename already exists in this project'
      });
    }

    // Add new resource
    const newResource = {
      filename: filename.trim(),
      url: url.trim(),
      description: description ? description.trim() : null,
      uploaded_at: new Date().toISOString()
    };

    const updatedResources = [...currentResources, newResource];

    const { data, error } = await supabase
      .from('project')
      .update({ ressources: updatedResources })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error adding resource:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to add resource',
        error: error.message
      });
    }

    res.status(201).json({
      success: true,
      message: 'Resource added successfully',
      data: {
        project: data,
        added_resource: newResource
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

// Remove a resource from a project $
/**
 * @swagger
 * /projects/{id}/resources/{filename}:
 *   delete:
 *     summary: Remove a resource from a project
 *     tags: [Project/Ressources]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Project ID
 *         schema:
 *           type: string
 *       - name: filename
 *         in: path
 *         required: true
 *         description: PDF filename to remove
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Resource removed successfully
 *       404:
 *         description: Project or resource not found
 *       500:
 *         description: Server error
 */
router.delete('/projects/:id/resources/:filename', async (req, res) => {
  try {
    const { id, filename } = req.params;

    if (!filename) {
      return res.status(400).json({
        success: false,
        message: 'Filename is required'
      });
    }

    // Get current project
    const { data: currentProject, error: getCurrentError } = await supabase
      .from('project')
      .select('ressources')
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

    const currentResources = currentProject.ressources || [];
    
    // Find and remove the resource
    const resourceIndex = currentResources.findIndex(r => r.filename === decodeURIComponent(filename));
    if (resourceIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found in this project'
      });
    }

    const removedResource = currentResources[resourceIndex];
    const updatedResources = currentResources.filter((_, index) => index !== resourceIndex);

    const { data, error } = await supabase
      .from('project')
      .update({ ressources: updatedResources })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error removing resource:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to remove resource',
        error: error.message
      });
    }

    res.status(200).json({
      success: true,
      message: 'Resource removed successfully',
      data: {
        project: data,
        removed_resource: removedResource
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

module.exports = router;
