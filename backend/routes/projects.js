const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { authenticateToken } = require('./auth');
const { sendNotificationToUser } = require('../socketHandler');

// GET /projects - Get all projects current user belongs to
router.get('/', authenticateToken, async (req, res) => {
  try {
    const projects = await query.all(`
      SELECT DISTINCT p.id, p.name, p.description, p.owner_id, p.created_at, u.username as owner_name
      FROM projects p
      JOIN users u ON p.owner_id = u.id
      LEFT JOIN project_members pm ON p.id = pm.project_id
      WHERE p.owner_id = ? OR pm.user_id = ?
      ORDER BY p.created_at DESC
    `, [req.user.id, req.user.id]);
    
    // Fetch stats for each project
    for (const project of projects) {
      const stats = await query.get(`
        SELECT 
          COUNT(*) as total_tasks,
          SUM(case when status = 'done' then 1 else 0 end) as completed_tasks
        FROM tasks 
        WHERE project_id = ?
      `, [project.id]);
      
      project.total_tasks = stats.total_tasks || 0;
      project.completed_tasks = stats.completed_tasks || 0;

      const members = await query.all(`
        SELECT pm.user_id, u.username, u.avatar_color, u.avatar_url
        FROM project_members pm
        JOIN users u ON pm.user_id = u.id
        WHERE pm.project_id = ?
      `, [project.id]);
      project.members = members;
    }

    res.json(projects);
  } catch (err) {
    console.error('Error fetching projects:', err);
    res.status(500).json({ error: 'Server error loading projects' });
  }
});

// GET /projects/:id - Get details of a single project
router.get('/:id', authenticateToken, async (req, res) => {
  const projectId = req.params.id;
  try {
    const project = await query.get(`
      SELECT p.id, p.name, p.description, p.owner_id, u.username as owner_name
      FROM projects p
      JOIN users u ON p.owner_id = u.id
      WHERE p.id = ?
    `, [projectId]);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Verify member permissions
    const membership = await query.get(
      'SELECT 1 FROM project_members WHERE project_id = ? AND user_id = ?',
      [projectId, req.user.id]
    );

    if (project.owner_id !== req.user.id && !membership) {
      return res.status(403).json({ error: 'Unauthorized to view this project' });
    }

    // Load members
    const members = await query.all(`
      SELECT u.id, u.username, u.email, u.avatar_color, u.avatar_url
      FROM project_members pm
      JOIN users u ON pm.user_id = u.id
      WHERE pm.project_id = ?
    `, [projectId]);

    project.members = members;
    res.json(project);
  } catch (err) {
    console.error('Error fetching project details:', err);
    res.status(500).json({ error: 'Server error loading project details' });
  }
});

// POST /projects - Create a new project
router.post('/', authenticateToken, async (req, res) => {
  const { name, description } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Project name is required' });
  }

  try {
    const result = await query.run(
      'INSERT INTO projects (name, description, owner_id) VALUES (?, ?, ?)',
      [name.trim(), description ? description.trim() : '', req.user.id]
    );

    const projectId = result.id;

    // Owner is automatically added as member
    await query.run(
      'INSERT INTO project_members (project_id, user_id) VALUES (?, ?)',
      [projectId, req.user.id]
    );

    res.status(201).json({
      id: projectId,
      name: name.trim(),
      description: description ? description.trim() : '',
      owner_id: req.user.id
    });
  } catch (err) {
    console.error('Error creating project:', err);
    res.status(500).json({ error: 'Server error creating project' });
  }
});

// POST /projects/:id/members - Add member to project
router.post('/:id/members', authenticateToken, async (req, res) => {
  const projectId = req.params.id;
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    // Check if project exists and req.user has admin/owner rights
    const project = await query.get('SELECT owner_id, name FROM projects WHERE id = ?', [projectId]);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Verify requesting user is member
    const requesterMembership = await query.get(
      'SELECT 1 FROM project_members WHERE project_id = ? AND user_id = ?',
      [projectId, req.user.id]
    );
    if (project.owner_id !== req.user.id && !requesterMembership) {
      return res.status(403).json({ error: 'Only project members can invite others' });
    }

    // Check if target user is already a member
    const existingMembership = await query.get(
      'SELECT 1 FROM project_members WHERE project_id = ? AND user_id = ?',
      [projectId, userId]
    );

    if (existingMembership) {
      return res.status(400).json({ error: 'User is already a member of this project' });
    }

    // Add member
    await query.run(
      'INSERT INTO project_members (project_id, user_id) VALUES (?, ?)',
      [projectId, userId]
    );

    // Save notification for added user
    const msg = `You have been added to the project "${project.name}" by ${req.user.username}`;
    const notifyRes = await query.run(
      'INSERT INTO notifications (user_id, project_id, type, message) VALUES (?, ?, ?, ?)',
      [userId, projectId, 'project_invite', msg]
    );

    const notificationObj = {
      id: notifyRes.id,
      project_id: projectId,
      task_id: null,
      type: 'project_invite',
      message: msg,
      is_read: 0,
      created_at: new Date().toISOString()
    };

    // Live Socket dispatch
    sendNotificationToUser(userId, notificationObj);

    // Fetch updated user info to return
    const memberInfo = await query.get('SELECT id, username, email, avatar_color, avatar_url FROM users WHERE id = ?', [userId]);

    res.status(201).json(memberInfo);
  } catch (err) {
    console.error('Error adding project member:', err);
    res.status(500).json({ error: 'Server error adding member' });
  }
});

// PUT /projects/:id - Update project name/description (owner only)
router.put('/:id', authenticateToken, async (req, res) => {
  const projectId = req.params.id;
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: 'Project name is required' });

  try {
    const project = await query.get('SELECT owner_id FROM projects WHERE id = ?', [projectId]);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (project.owner_id !== req.user.id) return res.status(403).json({ error: 'Only the owner can edit this project' });

    await query.run('UPDATE projects SET name = ?, description = ? WHERE id = ?',
      [name.trim(), description ? description.trim() : '', projectId]);

    res.json({ id: projectId, name: name.trim(), description: description || '' });
  } catch (err) {
    console.error('Error updating project:', err);
    res.status(500).json({ error: 'Server error updating project' });
  }
});

// DELETE /projects/:id - Delete project (owner only)
router.delete('/:id', authenticateToken, async (req, res) => {
  const projectId = req.params.id;
  try {
    const project = await query.get('SELECT owner_id FROM projects WHERE id = ?', [projectId]);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (project.owner_id !== req.user.id) return res.status(403).json({ error: 'Only the owner can delete this project' });

    await query.run('DELETE FROM projects WHERE id = ?', [projectId]);
    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    console.error('Error deleting project:', err);
    res.status(500).json({ error: 'Server error deleting project' });
  }
});

// DELETE /projects/:id/members/:userId - Remove member
router.delete('/:id/members/:userId', authenticateToken, async (req, res) => {
  const { id: projectId, userId } = req.params;
  try {
    const project = await query.get('SELECT owner_id FROM projects WHERE id = ?', [projectId]);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (project.owner_id !== req.user.id) return res.status(403).json({ error: 'Only the owner can remove members' });
    if (project.owner_id === Number(userId)) return res.status(400).json({ error: 'Cannot remove project owner' });

    await query.run('DELETE FROM project_members WHERE project_id = ? AND user_id = ?', [projectId, userId]);
    res.json({ message: 'Member removed' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
