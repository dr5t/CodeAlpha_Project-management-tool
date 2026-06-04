const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { authenticateToken } = require('./auth');
const { broadcastToProject, sendNotificationToUser } = require('../socketHandler');

// GET /api/comments/task/:taskId
router.get('/task/:taskId', authenticateToken, async (req, res) => {
  const taskId = req.params.taskId;
  try {
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
    res.status(500).json({ error: 'Server error loading comments' });
  }
});

// POST /api/comments/task/:taskId
router.post('/task/:taskId', authenticateToken, async (req, res) => {
  const taskId = req.params.taskId;
  const { content } = req.body;
  if (!content || !content.trim()) return res.status(400).json({ error: 'Comment content cannot be empty' });

  try {
    const task = await query.get('SELECT project_id, title, assignee_id FROM tasks WHERE id = ?', [taskId]);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    const projectId = task.project_id;

    const result = await query.run(
      'INSERT INTO comments (task_id, user_id, content) VALUES (?, ?, ?)',
      [taskId, req.user.id, content.trim()]
    );

    const newComment = await query.get(`
      SELECT c.id, c.task_id, c.user_id, c.content, c.created_at,
             u.username, u.avatar_color
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `, [result.id]);

    // Notify assignee if different from commenter
    if (task.assignee_id && Number(task.assignee_id) !== Number(req.user.id)) {
      const msg = `${req.user.username} commented on "${task.title}"`;
      const notifyRes = await query.run(
        'INSERT INTO notifications (user_id, project_id, task_id, type, message) VALUES (?, ?, ?, ?, ?)',
        [task.assignee_id, projectId, taskId, 'comment_added', msg]
      );
      sendNotificationToUser(task.assignee_id, {
        id: notifyRes.id, project_id: projectId, task_id: taskId,
        type: 'comment_added', message: msg, is_read: 0,
        created_at: new Date().toISOString()
      });
    }

    broadcastToProject(projectId, { type: 'BOARD_UPDATED', projectId, senderId: req.user.id });
    res.status(201).json(newComment);
  } catch (err) {
    console.error('Error adding comment:', err);
    res.status(500).json({ error: 'Server error adding comment' });
  }
});

// DELETE /api/comments/:commentId
router.delete('/:commentId', authenticateToken, async (req, res) => {
  const { commentId } = req.params;
  try {
    const comment = await query.get('SELECT user_id FROM comments WHERE id = ?', [commentId]);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    if (comment.user_id !== req.user.id) return res.status(403).json({ error: 'Only the author can delete this comment' });
    await query.run('DELETE FROM comments WHERE id = ?', [commentId]);
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Legacy: GET /api/comments/:taskId
router.get('/:taskId', authenticateToken, async (req, res) => {
  const taskId = req.params.taskId;
  try {
    const comments = await query.all(`
      SELECT c.id, c.task_id, c.user_id, c.content, c.created_at, u.username, u.avatar_color
      FROM comments c JOIN users u ON c.user_id = u.id
      WHERE c.task_id = ? ORDER BY c.created_at ASC
    `, [taskId]);
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Legacy: POST /api/comments/:taskId
router.post('/:taskId', authenticateToken, async (req, res) => {
  const taskId = req.params.taskId;
  const { content } = req.body;
  if (!content?.trim()) return res.status(400).json({ error: 'Content required' });
  try {
    const result = await query.run('INSERT INTO comments (task_id, user_id, content) VALUES (?, ?, ?)', [taskId, req.user.id, content.trim()]);
    const comment = await query.get(
      'SELECT c.id, c.task_id, c.user_id, c.content, c.created_at, u.username, u.avatar_color FROM comments c JOIN users u ON c.user_id = u.id WHERE c.id = ?',
      [result.id]
    );
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
