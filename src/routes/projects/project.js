const express = require('express');
const router = express.Router();
const supabase = require('../../../config/supabaseClient.js');

/**
 * @swagger
 * tags:
 *   name: Project
 *   description: Project management endpoints
 */

// Get all projects
/**
 * @swagger
 * /projects:
 *   get:
 *     summary: Get all projects
 *     tags: [Project]
 *     responses:
 *       200:
 *         description: Projects retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/projects', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('project')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', error);
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

// Get a project by id
/**
 * @swagger
 * /projects/{id}:
 *   get:
 *     summary: Get a project by ID
 *     tags: [Project]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Project ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Project retrieved successfully
 *       404:
 *         description: Project not found
 *       500:
 *         description: Server error
 */
router.get('/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Validate that ID is provided
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Project ID is required'
      });
    }

    const { data, error } = await supabase
      .from('project')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        });
      }

      console.error('Error fetching project:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch project',
        error: error.message
      });
    }

    res.status(200).json({
      success: true,
      message: 'Project retrieved successfully',
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


// Create a new project
/**
 * @swagger
 * /projects:
 *   post:
 *     summary: Create a new project
 *     tags: [Project]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - ressources
 *               - id_creator
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               ressources:
 *                 type: array
 *                 items:
 *                   type: object
 *               id_creator:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Project created successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Duplicate project name
 *       500:
 *         description: Server error
 */
router.post('/projects', async (req, res) => {
  try {
    const { name, description, ressources, is_active, id_creator, id_promotion } = req.body;

    // Validation
    if (!name || !description || !ressources || !id_creator || !id_promotion) {
      return res.status(400).json({
        success: false,
        message: 'Name, description, ressources, creator ID, and promotion ID are required'
      });
    }

    if (name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Project name must be at least 2 characters long'
      });
    }

    if (description.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Project description must be at least 10 characters long'
      });
    }

    // Validate creator ID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id_creator)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid creator ID format'
      });
    }

    // Validate promotion ID format
    if (!uuidRegex.test(id_promotion)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid promotion ID format'
      });
    }

    // Check if project name already exists for this creator
    const { data: existingProject, error: checkError } = await supabase
      .from('project')
      .select('id')
      .eq('name', name.trim())
      .eq('id_creator', id_creator)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing project:', checkError);
      return res.status(500).json({
        success: false,
        message: 'Failed to check existing project',
        error: checkError.message
      });
    }

    if (existingProject) {
      return res.status(409).json({
        success: false,
        message: 'A project with this name already exists for this creator'
      });
    }

    const projectData = {
      name: name.trim(),
      description: description.trim(),
      ressources: ressources,
      is_active: is_active !== undefined ? is_active : true,
      id_creator: id_creator,
      id_promotion: id_promotion
    };

    const { data, error } = await supabase
      .from('project')
      .insert([projectData])
      .select()
      .single();

    if (error) {
      console.error('Error creating project:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create project',
        error: error.message
      });
    }

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
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

// Update a project
/**
 * @swagger
 * /projects/{id}:
 *   patch:
 *     summary: Update a project
 *     tags: [Project]
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
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               ressources:
 *                 type: array
 *                 items:
 *                   type: object
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Project updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Project not found
 *       409:
 *         description: Duplicate project name
 *       500:
 *         description: Server error
 */
router.patch('/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, ressources, is_active, id_promotion } = req.body;

    // Check if at least one field is provided
    if (!name && !description && ressources === undefined && is_active === undefined && !id_promotion) {
      return res.status(400).json({
        success: false,
        message: 'At least one field must be provided for update'
      });
    }

    // Get current project data to check creator
    const { data: currentProject, error: getCurrentError } = await supabase
      .from('project')
      .select('*')
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

    const updateData = {};

    // Validate and prepare name update
    if (name !== undefined) {
      if (!name || name.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Project name must be at least 2 characters long'
        });
      }

      // Check if new name already exists for this creator (excluding current project)
      const { data: existingProject, error: checkError } = await supabase
        .from('project')
        .select('id')
        .eq('name', name.trim())
        .eq('id_creator', currentProject.id_creator)
        .neq('id', id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing project name:', checkError);
        return res.status(500).json({
          success: false,
          message: 'Failed to check existing project name',
          error: checkError.message
        });
      }

      if (existingProject) {
        return res.status(409).json({
          success: false,
          message: 'A project with this name already exists for this creator'
        });
      }

      updateData.name = name.trim();
    }

    // Prepare other fields for update
    if (description !== undefined) {
      if (!description || description.trim().length < 10) {
        return res.status(400).json({
          success: false,
          message: 'Project description must be at least 10 characters long'
        });
      }
      updateData.description = description.trim();
    }

    if (ressources !== undefined) {
      if (!Array.isArray(ressources) || ressources.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Ressources must be a non-empty array of PDF files'
        });
      }

      // Validate each resource in the array
      for (let i = 0; i < ressources.length; i++) {
        const resource = ressources[i];
        
        if (!resource || typeof resource !== 'object') {
          return res.status(400).json({
            success: false,
            message: `Resource at index ${i} must be a valid object`
          });
        }

        if (!resource.filename || typeof resource.filename !== 'string' || resource.filename.trim().length === 0) {
          return res.status(400).json({
            success: false,
            message: `Resource at index ${i} must have a valid filename`
          });
        }

        if (!resource.filename.toLowerCase().endsWith('.pdf')) {
          return res.status(400).json({
            success: false,
            message: `Resource at index ${i} must be a PDF file (filename: ${resource.filename})`
          });
        }

        if (!resource.url || typeof resource.url !== 'string' || resource.url.trim().length === 0) {
          return res.status(400).json({
            success: false,
            message: `Resource at index ${i} must have a valid download URL`
          });
        }

        // Optional: Validate URL format
        try {
          new URL(resource.url);
        } catch (error) {
          return res.status(400).json({
            success: false,
            message: `Resource at index ${i} has an invalid URL format`
          });
        }
      }

      updateData.ressources = ressources;
    }

    if (is_active !== undefined) {
      updateData.is_active = is_active;
    }

    if (id_promotion !== undefined) {
      // Validate promotion ID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id_promotion)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid promotion ID format'
        });
      }
      updateData.id_promotion = id_promotion;
    }

    const { data, error } = await supabase
      .from('project')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating project:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update project',
        error: error.message
      });
    }

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
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

// Delete a project
/**
 * @swagger
 * /projects/{id}:
 *   delete:
 *     summary: Delete a project
 *     tags: [Project]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Project ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Project deleted successfully
 *       404:
 *         description: Project not found
 *       500:
 *         description: Server error
 */
router.delete('/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if project exists before deletion
    const { data: existingProject, error: checkError } = await supabase
      .from('project')
      .select('*')
      .eq('id', id)
      .single();

    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        });
      }

      console.error('Error checking project existence:', checkError);
      return res.status(500).json({
        success: false,
        message: 'Failed to check project existence',
        error: checkError.message
      });
    }

    const { error } = await supabase
      .from('project')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting project:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete project',
        error: error.message
      });
    }

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully',
      data: {
        deletedProject: existingProject
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