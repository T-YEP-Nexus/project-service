const express = require('express');
const router = express.Router();
const supabase = require('../../config/supabaseClient.js');


// CRUD routes for the 'project' table

// Get all projects
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
router.get('/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
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

// Get projects by creator ID
router.get('/projects/creator/:id_creator', async (req, res) => {
  try {
    const { id_creator } = req.params;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!id_creator || !uuidRegex.test(id_creator)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid creator ID provided'
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

// Get active projects only
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

// Create a new project
router.post('/projects', async (req, res) => {
  try {
    const { name, description, ressources, is_active, id_creator } = req.body;

    // Validation
    if (!name || !description || !ressources || !id_creator) {
      return res.status(400).json({
        success: false,
        message: 'Name, description, ressources, and creator ID are required'
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

    if (!Array.isArray(ressources) || ressources.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Ressources must be a non-empty array of PDF files'
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
      id_creator: id_creator
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
router.patch('/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, ressources, is_active } = req.body;

    // Check if at least one field is provided
    if (!name && !description && ressources === undefined && is_active === undefined) {
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

// Get project resources (PDF files)
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

// Add a resource to a project
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

// Remove a resource from a project
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

// Put a projet to inactive 
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
