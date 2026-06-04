const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { authenticateToken } = require('./auth');
const { broadcastToProject, sendNotificationToUser } = require('../socketHandler');

// GET /projects/:projectId/tasks - Get all tasks in a project
router.get('/project/:projectId', authenticateToken, async (req, res) => {
  const projectId = req.params.projectId;
  try {
    // Verify membership
    const membership = await query.get(
      'SELECT 1 FROM project_members pm JOIN projects p ON p.id = pm.project_id WHERE p.id = ? AND (p.owner_id = ? OR pm.user_id = ?)',
      [projectId, req.user.id, req.user.id]
    );

    if (!membership) {
      return res.status(403).json({ error: 'Unauthorized to view this project tasks' });
    }

    const tasks = await query.all(`
      SELECT t.id, t.project_id, t.title, t.description, t.status, t.priority, t.due_date, t.assignee_id, t.position, t.created_at,
             u.username as assignee_name, u.avatar_color as assignee_color,
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

// POST /projects/:projectId/tasks - Create a new task
router.post('/project/:projectId', authenticateToken, async (req, res) => {
  const projectId = req.params.projectId;
  const { title, description, status, priority, due_date, assignee_id } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Task title is required' });
  }

  const taskStatus = status || 'todo';
  const taskPriority = priority || 'medium';

  try {
    // Verify membership
    const membership = await query.get(
      'SELECT 1 FROM project_members pm JOIN projects p ON p.id = pm.project_id WHERE p.id = ? AND (p.owner_id = ? OR pm.user_id = ?)',
      [projectId, req.user.id, req.user.id]
    );

    if (!membership) {
      return res.status(403).json({ error: 'Unauthorized to add tasks' });
    }

    // Get max position for column status
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

    // Fetch newly created task with assignee name
    const newTask = await query.get(`
      SELECT t.id, t.project_id, t.title, t.description, t.status, t.priority, t.due_date, t.assignee_id, t.position, t.created_at,
             u.username as assignee_name, u.avatar_color as assignee_color, 0 as comment_count
      FROM tasks t
      LEFT JOIN users u ON t.assignee_id = u.id
      WHERE t.id = ?
    `, [taskId]);

    // Send notifications if user is assigned
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

    // Broadcast Board Update via socket
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

// GET /tasks/:id - Fetch single task by ID
router.get('/:id', authenticateToken, async (req, res) => {
  const taskId = req.params.id;
  try {
    const task = await query.get(`
      SELECT t.id, t.project_id, t.title, t.description, t.status, t.priority, t.due_date,
             t.assignee_id, t.position, t.created_at,
             u.username as assignee_username, u.avatar_color as assignee_color,
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

    // Verify membership
    const membership = await query.get(
      'SELECT 1 FROM project_members pm JOIN projects p ON p.id = pm.project_id WHERE p.id = ? AND (p.owner_id = ? OR pm.user_id = ?)',
      [projectId, req.user.id, req.user.id]
    );

    if (!membership) {
      return res.status(403).json({ error: 'Unauthorized to update tasks' });
    }

    // Check if assignee changed to trigger a notification
    const oldAssignee = task.assignee_id;
    const newAssignee = assignee_id ? Number(assignee_id) : null;

    // Update DB
    await query.run(`
      UPDATE tasks 
      SET title = ?, description = ?, status = ?, priority = ?, due_date = ?, assignee_id = ?
      WHERE id = ?
    `, [title.trim(), description ? description.trim() : '', status, priority, due_date || null, newAssignee, taskId]);

    // Fetch updated task
    const updatedTask = await query.get(`
      SELECT t.id, t.project_id, t.title, t.description, t.status, t.priority, t.due_date, t.assignee_id, t.position, t.created_at,
             u.username as assignee_name, u.avatar_color as assignee_color,
             (SELECT COUNT(*) FROM comments c WHERE c.task_id = t.id) as comment_count
      FROM tasks t
      LEFT JOIN users u ON t.assignee_id = u.id
      WHERE t.id = ?
    `, [taskId]);

    // If new assignee is set and is not the current user
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

    // Broadcast Board & Task Updates
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

// PUT /tasks/project/:projectId/reorder - Drag & drop card position updates
router.put('/project/:projectId/reorder', authenticateToken, async (req, res) => {
  const projectId = req.params.projectId;
  const { tasks } = req.body; // Array of { id, status, position }

  if (!tasks || !Array.isArray(tasks)) {
    return res.status(400).json({ error: 'Tasks array is required' });
  }

  try {
    // Verify membership
    const membership = await query.get(
      'SELECT 1 FROM project_members pm JOIN projects p ON p.id = pm.project_id WHERE p.id = ? AND (p.owner_id = ? OR pm.user_id = ?)',
      [projectId, req.user.id, req.user.id]
    );

    if (!membership) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Perform updates in serialized sequence
    // A database transaction is best for reliability
    await query.run('BEGIN TRANSACTION');
    for (const t of tasks) {
      await query.run(
        'UPDATE tasks SET status = ?, position = ? WHERE id = ? AND project_id = ?',
        [t.status, t.position, t.id, projectId]
      );
    }
    await query.run('COMMIT');

    // Broadcast update to other users
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

// DELETE /tasks/:id - Delete a task
router.delete('/:id', authenticateToken, async (req, res) => {
  const taskId = req.params.id;
  try {
    const task = await query.get('SELECT project_id, title FROM tasks WHERE id = ?', [taskId]);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const projectId = task.project_id;

    // Verify membership
    const membership = await query.get(
      'SELECT 1 FROM project_members pm JOIN projects p ON p.id = pm.project_id WHERE p.id = ? AND (p.owner_id = ? OR pm.user_id = ?)',
      [projectId, req.user.id, req.user.id]
    );

    if (!membership) {
      return res.status(403).json({ error: 'Unauthorized to delete tasks' });
    }

    await query.run('DELETE FROM tasks WHERE id = ?', [taskId]);

    // Broadcast Board Update
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
