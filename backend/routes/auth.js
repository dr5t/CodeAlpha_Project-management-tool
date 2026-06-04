const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../db');

const JWT_SECRET = 'project-manager-secret-token-key-2026';

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Access token required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
}

// Helper to select random color for user avatar
const AVATAR_COLORS = [
  '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', 
  '#ef4444', '#06b6d4', '#84cc16', '#14b8a6', '#6366f1'
];

// Register endpoint
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // Check if user exists
    const existingUser = await query.get(
      'SELECT * FROM users WHERE email = ? OR username = ?',
      [email, username]
    );

    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already registered' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    const color = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

    // Insert user
    const insertResult = await query.run(
      'INSERT INTO users (username, email, password_hash, avatar_color) VALUES (?, ?, ?, ?)',
      [username.toLowerCase().trim(), email.toLowerCase().trim(), passwordHash, color]
    );

    const user = {
      id: insertResult.id,
      username: username.toLowerCase().trim(),
      email: email.toLowerCase().trim(),
      avatar_color: color,
      avatar_url: null
    };

    // Generate Token
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ user, token });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const userRow = await query.get(
      'SELECT id, username, email, password_hash, avatar_color FROM users WHERE email = ?',
      [email.toLowerCase().trim()]
    );

    if (!userRow) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, userRow.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const user = {
      id: userRow.id,
      username: userRow.username,
      email: userRow.email,
      avatar_color: userRow.avatar_color,
      avatar_url: userRow.avatar_url || null
    };

    const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });

    res.json({ user, token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Get current user details
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const userRow = await query.get(
      'SELECT id, username, email, avatar_color, avatar_url FROM users WHERE id = ?',
      [req.user.id]
    );
    if (!userRow) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user: userRow });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// List all system users
router.get('/users', authenticateToken, async (req, res) => {
  try {
    const usersList = await query.all(
      'SELECT id, username, email, avatar_color, avatar_url FROM users ORDER BY username ASC'
    );
    res.json(usersList);
  } catch (err) {
    res.status(500).json({ error: 'Server error loading user list' });
  }
});

// Update profile (username, email, avatar_color)
router.put('/profile', authenticateToken, async (req, res) => {
  const { username, email, avatar_color } = req.body;
  if (!username || !email) return res.status(400).json({ error: 'Username and email are required' });

  try {
    // Check uniqueness excluding current user
    const conflict = await query.get(
      'SELECT id FROM users WHERE (email = ? OR username = ?) AND id != ?',
      [email.toLowerCase().trim(), username.toLowerCase().trim(), req.user.id]
    );
    if (conflict) return res.status(400).json({ error: 'Username or email already taken' });

    await query.run(
      'UPDATE users SET username = ?, email = ?, avatar_color = ? WHERE id = ?',
      [username.toLowerCase().trim(), email.toLowerCase().trim(), avatar_color || '#6366f1', req.user.id]
    );

    const updated = await query.get(
      'SELECT id, username, email, avatar_color, avatar_url FROM users WHERE id = ?',
      [req.user.id]
    );

    const newToken = require('jsonwebtoken').sign(
      { id: updated.id, username: updated.username, email: updated.email, avatar_color: updated.avatar_color },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ user: updated, token: newToken });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ error: 'Server error updating profile' });
  }
});

// Change password
router.patch('/profile/password', authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Both passwords required' });
  if (newPassword.length < 6) return res.status(400).json({ error: 'New password must be at least 6 characters' });

  try {
    const userRow = await query.get('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);
    const isMatch = await bcrypt.compare(currentPassword, userRow.password_hash);
    if (!isMatch) return res.status(400).json({ error: 'Current password is incorrect' });

    const newHash = await bcrypt.hash(newPassword, 10);
    await query.run('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, req.user.id]);
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Password change error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete account
router.delete('/profile', authenticateToken, async (req, res) => {
  try {
    await query.run('DELETE FROM users WHERE id = ?', [req.user.id]);
    res.json({ message: 'Account deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = {
  router,
  authenticateToken
};
