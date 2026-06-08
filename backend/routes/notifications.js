const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { authenticateToken } = require('./auth');

router.get('/', authenticateToken, async (req, res) => {
  try {
    const notifications = await query.all(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
      [req.user.id]
    );
    res.json(notifications);
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ error: 'Server error loading notifications' });
  }
});

router.put('/:id/read', authenticateToken, async (req, res) => {
  const notificationId = req.params.id;
  try {
    await query.run(
      'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?',
      [notificationId, req.user.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Error marking notification as read:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/read-all', authenticateToken, async (req, res) => {
  try {
    await query.run(
      'UPDATE notifications SET is_read = 1 WHERE user_id = ?',
      [req.user.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Error marking all notifications as read:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
