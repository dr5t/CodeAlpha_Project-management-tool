const express = require('express');
const cors = require('cors');
const http = require('http');
const path = require('path');
const multer = require('multer');
const { initDB, query } = require('./db');
const { initSocket } = require('./socketHandler');

const { router: authRouter, authenticateToken } = require('./routes/auth');
const projectsRouter = require('./routes/projects');
const tasksRouter = require('./routes/tasks');
const commentsRouter = require('./routes/comments');
const notificationsRouter = require('./routes/notifications');

const app = express();
const server = http.createServer(app);

initDB();
initSocket(server);

app.use(cors());
app.use(express.json());

const uploadsPath = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsPath));

const avatarStorage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, path.join(__dirname, 'uploads/avatars'));
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `avatar_${req.user?.id || Date.now()}_${Date.now()}${ext}`);
  }
});
const avatarUpload = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  }
});

app.post('/api/auth/profile/avatar', authenticateToken, avatarUpload.single('avatar'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image file provided' });
  try {
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    await query.run('UPDATE users SET avatar_url = ? WHERE id = ?', [avatarUrl, req.user.id]);
    const updated = await query.get(
      'SELECT id, username, email, avatar_color, avatar_url FROM users WHERE id = ?',
      [req.user.id]
    );
    res.json({ user: updated, avatarUrl });
  } catch (err) {
    console.error('Avatar upload error:', err);
    res.status(500).json({ error: 'Server error saving avatar' });
  }
});

app.delete('/api/auth/profile/avatar', authenticateToken, async (req, res) => {
  try {
    await query.run('UPDATE users SET avatar_url = NULL WHERE id = ?', [req.user.id]);
    res.json({ message: 'Avatar removed' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.use('/api/auth', authRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/comments', commentsRouter);
app.use('/api/notifications', notificationsRouter);

const frontendDistPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendDistPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(frontendDistPath, 'index.html'), (err) => {
    if (err) res.status(200).send('Backend API running. Start frontend dev server separately.');
  });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
module.exports = server;
