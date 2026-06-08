const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { authenticateToken } = require('./auth');
const { broadcastToProject, sendNotificationToUser } = require('../socketHandler');

router.get('/project/:projectId', authenticateToken, async (req, res) => {
  const projectId = req.params.projectId;
  try {
    const membership = await query.get(
      'SELECT 1 FROM project_members pm JOIN projects p ON p.id = pm.project_id WHERE p.id = ? AND (p.owner_id = ? OR pm.user_id = ?)',
      [projectId, req.user.id, req.user.id]
    );

    if (!membership) {
      return res.status(403).json({ error: 'Unauthorized to view this project tasks' });
    }

    const tasks = await query.all(`
      SELECT t.id, t.project_id, t.title, t.description, t.status, t.priority, t.due_date, t.assignee_id, t.position, t.created_at,
             u.username as assignee_name, u.avatar_color as assignee_color, u.avatar_url as assignee_avatar_url,
             (SELECT COUNT(*) FROM comments c WHERE c.task_id = t.id) as comment_count
      FROM tasks t
      LEFT JOIN users u ON t.assignee_id = u.id
      WHERE t.project_id = ?
      ORDER BY t.position ASC, t.created_at DESC
    `, [projectId]);

    res.json(tasks);
  } catch (err) {
    console.error('Error fetching tasks:', err);
    res.status(500).json({ error: 'Server error loading tasks' });
  }
});

router.post('/project/:projectId', authenticateToken, async (req, res) => {
  const projectId = req.params.projectId;
  const { title, description, status, priority, due_date, assignee_id } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Task title is required' });
  }

  const taskStatus = status || 'todo';
  const taskPriority = priority || 'medium';

  try {
    const membership = await query.get(
      'SELECT 1 FROM project_members pm JOIN projects p ON p.id = pm.project_id WHERE p.id = ? AND (p.owner_id = ? OR pm.user_id = ?)',
      [projectId, req.user.id, req.user.id]
    );

    if (!membership) {
      return res.status(403).json({ error: 'Unauthorized to add tasks' });
    }

    const posResult = await query.get(
      'SELECT MAX(position) as maxPos FROM tasks WHERE project_id = ? AND status = ?',
      [projectId, taskStatus]
    );
    const position = (posResult.maxPos !== null && posResult.maxPos !== undefined) ? posResult.maxPos + 1 : 0;

    const result = await query.run(`
      INSERT INTO tasks (project_id, title, description, status, priority, due_date, assignee_id, position)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [projectId, title.trim(), description ? description.trim() : '', taskStatus, taskPriority, due_date || null, assignee_id || null, position]);

    const taskId = result.id;

    const newTask = await query.get(`
      SELECT t.id, t.project_id, t.title, t.description, t.status, t.priority, t.due_date, t.assignee_id, t.position, t.created_at,
             u.username as assignee_name, u.avatar_color as assignee_color, u.avatar_url as assignee_avatar_url, 0 as comment_count
      FROM tasks t
      LEFT JOIN users u ON t.assignee_id = u.id
      WHERE t.id = ?
    `, [taskId]);

    if (assignee_id && Number(assignee_id) !== Number(req.user.id)) {
      const project = await query.get('SELECT name FROM projects WHERE id = ?', [projectId]);
      const msg = `You have been assigned to "${title}" in project "${project.name}" by ${req.user.username}`;
      const notifyRes = await query.run(
        'INSERT INTO notifications (user_id, project_id, task_id, type, message) VALUES (?, ?, ?, ?, ?)',
        [assignee_id, projectId, taskId, 'task_assigned', msg]
      );
      
      sendNotificationToUser(assignee_id, {
        id: notifyRes.id,
        project_id: projectId,
        task_id: taskId,
        type: 'task_assigned',
        message: msg,
        is_read: 0,
        created_at: new Date().toISOString()
      });
    }

    broadcastToProject(projectId, {
      type: 'BOARD_UPDATED',
      projectId: projectId,
      senderId: req.user.id
    });

    res.status(201).json(newTask);
  } catch (err) {
    console.error('Error creating task:', err);
    res.status(500).json({ error: 'Server error creating task' });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  const taskId = req.params.id;
  try {
    const task = await query.get(`
      SELECT t.id, t.project_id, t.title, t.description, t.status, t.priority, t.due_date,
             t.assignee_id, t.position, t.created_at,
             u.username as assignee_username, u.avatar_color as assignee_color, u.avatar_url as assignee_avatar_url,
             (SELECT COUNT(*) FROM comments c WHERE c.task_id = t.id) as comment_count
      FROM tasks t
      LEFT JOIN users u ON t.assignee_id = u.id
      WHERE t.id = ?
    `, [taskId]);

    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (err) {
    console.error('Error fetching task:', err);
    res.status(500).json({ error: 'Server error fetching task' });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  const taskId = req.params.id;
  const { title, description, status, priority, due_date, assignee_id } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Task title is required' });
  }

  try {
    const task = await query.get('SELECT * FROM tasks WHERE id = ?', [taskId]);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const projectId = task.project_id;

    const membership = await query.get(
      'SELECT 1 FROM project_members pm JOIN projects p ON p.id = pm.project_id WHERE p.id = ? AND (p.owner_id = ? OR pm.user_id = ?)',
      [projectId, req.user.id, req.user.id]
    );

    if (!membership) {
      return res.status(403).json({ error: 'Unauthorized to update tasks' });
    }

    const oldAssignee = task.assignee_id;
    const newAssignee = assignee_id ? Number(assignee_id) : null;

    await query.run(`
      UPDATE tasks 
      SET title = ?, description = ?, status = ?, priority = ?, due_date = ?, assignee_id = ?
      WHERE id = ?
    `, [title.trim(), description ? description.trim() : '', status, priority, due_date || null, newAssignee, taskId]);

    const updatedTask = await query.get(`
      SELECT t.id, t.project_id, t.title, t.description, t.status, t.priority, t.due_date, t.assignee_id, t.position, t.created_at,
             u.username as assignee_name, u.avatar_color as assignee_color, u.avatar_url as assignee_avatar_url,
             (SELECT COUNT(*) FROM comments c WHERE c.task_id = t.id) as comment_count
      FROM tasks t
      LEFT JOIN users u ON t.assignee_id = u.id
      WHERE t.id = ?
    `, [taskId]);

    if (newAssignee && newAssignee !== oldAssignee && newAssignee !== Number(req.user.id)) {
      const project = await query.get('SELECT name FROM projects WHERE id = ?', [projectId]);
      const msg = `You have been assigned to "${title}" in "${project.name}" by ${req.user.username}`;
      const notifyRes = await query.run(
        'INSERT INTO notifications (user_id, project_id, task_id, type, message) VALUES (?, ?, ?, ?, ?)',
        [newAssignee, projectId, taskId, 'task_assigned', msg]
      );

      sendNotificationToUser(newAssignee, {
        id: notifyRes.id,
        project_id: projectId,
        task_id: taskId,
        type: 'task_assigned',
        message: msg,
        is_read: 0,
        created_at: new Date().toISOString()
      });
    }

    broadcastToProject(projectId, {
      type: 'BOARD_UPDATED',
      projectId: projectId,
      senderId: req.user.id
    });

    broadcastToProject(projectId, {
      type: 'TASK_UPDATED',
      taskId: taskId,
      task: updatedTask
    });

    res.json(updatedTask);
  } catch (err) {
    console.error('Error updating task:', err);
    res.status(500).json({ error: 'Server error updating task' });
  }
});

router.put('/project/:projectId/reorder', authenticateToken, async (req, res) => {
  const projectId = req.params.projectId;
  const { tasks } = req.body;

  if (!tasks || !Array.isArray(tasks)) {
    return res.status(400).json({ error: 'Tasks array is required' });
  }

  try {
    const membership = await query.get(
      'SELECT 1 FROM project_members pm JOIN projects p ON p.id = pm.project_id WHERE p.id = ? AND (p.owner_id = ? OR pm.user_id = ?)',
      [projectId, req.user.id, req.user.id]
    );

    if (!membership) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await query.run('BEGIN TRANSACTION');
    for (const t of tasks) {
      await query.run(
        'UPDATE tasks SET status = ?, position = ? WHERE id = ? AND project_id = ?',
        [t.status, t.position, t.id, projectId]
      );
    }
    await query.run('COMMIT');

    broadcastToProject(projectId, {
      type: 'BOARD_UPDATED',
      projectId: projectId,
      senderId: req.user.id
    });

    res.json({ message: 'Tasks reordered successfully' });
  } catch (err) {
    await query.run('ROLLBACK').catch(() => {});
    console.error('Error reordering tasks:', err);
    res.status(500).json({ error: 'Server error reordering tasks' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  const taskId = req.params.id;
  try {
    const task = await query.get('SELECT project_id, title FROM tasks WHERE id = ?', [taskId]);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const projectId = task.project_id;

    const membership = await query.get(
      'SELECT 1 FROM project_members pm JOIN projects p ON p.id = pm.project_id WHERE p.id = ? AND (p.owner_id = ? OR pm.user_id = ?)',
      [projectId, req.user.id, req.user.id]
    );

    if (!membership) {
      return res.status(403).json({ error: 'Unauthorized to delete tasks' });
    }

    await query.run('DELETE FROM tasks WHERE id = ?', [taskId]);

    broadcastToProject(projectId, {
      type: 'BOARD_UPDATED',
      projectId: projectId,
      senderId: req.user.id
    });

    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    console.error('Error deleting task:', err);
    res.status(500).json({ error: 'Server error deleting task' });
  }
});

module.exports = router;
