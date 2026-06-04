const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { authenticateToken } = require('./auth');
const { broadcastToProject, sendNotificationToUser } = require('../socketHandler');

// GET /tasks/:taskId/comments - Get comments for a task
router.get('/:taskId', authenticateToken, async (req, res) => {
  const taskId = req.params.taskId;
  try {
    // Validate project membership through task
    const task = await query.get('SELECT project_id FROM tasks WHERE id = ?', [taskId]);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const membership = await query.get(
      'SELECT 1 FROM project_members pm JOIN projects p ON p.id = pm.project_id WHERE p.id = ? AND (p.owner_id = ? OR pm.user_id = ?)',
      [task.project_id, req.user.id, req.user.id]
    );

    if (!membership) {
      return res.status(403).json({ error: 'Unauthorized to view comments' });
    }

    const comments = await query.all(`
      SELECT c.id, c.task_id, c.user_id, c.content, c.created_at,
             u.username, u.avatar_color
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.task_id = ?
      ORDER BY c.created_at ASC
    `, [taskId]);

    res.json(comments);
  } catch (err) {
    console.error('Error fetching comments:', err);
    res.status(500).json({ error: 'Server error loading comments' });
  }
});

// POST /tasks/:taskId/comments - Add comment to a task
router.post('/:taskId', authenticateToken, async (req, res) => {
  const taskId = req.params.taskId;
  const { content } = req.body;

  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Comment content cannot be empty' });
  }

  try {
    const task = await query.get('SELECT project_id, title, assignee_id FROM tasks WHERE id = ?', [taskId]);
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
      return res.status(403).json({ error: 'Unauthorized to add comments' });
    }

    const result = await query.run(
      'INSERT INTO comments (task_id, user_id, content) VALUES (?, ?, ?)',
      [taskId, req.user.id, content.trim()]
    );

    const commentId = result.id;

    // Fetch newly created comment info
    const newComment = await query.get(`
      SELECT c.id, c.task_id, c.user_id, c.content, c.created_at,
             u.username, u.avatar_color
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `, [commentId]);

    // Send notification to the assignee if they aren't the author
    if (task.assignee_id && Number(task.assignee_id) !== Number(req.user.id)) {
      const msg = `${req.user.username} commented on your task "${task.title}": "${content.substring(0, 30)}${content.length > 30 ? '...' : ''}"`;
      const notifyRes = await query.run(
        'INSERT INTO notifications (user_id, project_id, task_id, type, message) VALUES (?, ?, ?, ?, ?)',
        [task.assignee_id, projectId, taskId, 'task_comment', msg]
      );

      sendNotificationToUser(task.assignee_id, {
        id: notifyRes.id,
        project_id: projectId,
        task_id: taskId,
        type: 'task_comment',
        message: msg,
        is_read: 0,
        created_at: new Date().toISOString()
      });
    }

    // Broadcast new comment to anyone viewing the project
    broadcastToProject(projectId, {
      type: 'COMMENT_ADDED',
      taskId: taskId,
      comment: newComment
    });

    // Also broadcast board updated to sync comment counters
    broadcastToProject(projectId, {
      type: 'BOARD_UPDATED',
      projectId: projectId,
      senderId: req.user.id
    });

    res.status(201).json(newComment);
  } catch (err) {
    console.error('Error adding comment:', err);
    res.status(500).json({ error: 'Server error adding comment' });
  }
});

module.exports = router;
