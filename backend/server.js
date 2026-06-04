const express = require('express');
const cors = require('cors');
const http = require('http');
const path = require('path');
const { initDB } = require('./db');
const { initSocket } = require('./socketHandler');

const { router: authRouter } = require('./routes/auth');
const projectsRouter = require('./routes/projects');
const tasksRouter = require('./routes/tasks');
const commentsRouter = require('./routes/comments');
const notificationsRouter = require('./routes/notifications');

const app = express();
const server = http.createServer(app);

// Initialize database connection and schemas
initDB();

// Initialize WebSocket server attached to HTTP server
initSocket(server);

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// API Endpoint routing
app.use('/api/auth', authRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/comments', commentsRouter);
app.use('/api/notifications', notificationsRouter);

// Serve static frontend assets if built
const frontendDistPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendDistPath));

// Fallback all non-API paths to index.html for Single Page App router compatibility
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return next();
  }
  res.sendFile(path.join(frontendDistPath, 'index.html'), (err) => {
    if (err) {
      res.status(200).send('Backend API and WebSockets server are running. Run "npm run dev" to start frontend in development mode.');
    }
  });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
module.exports = server;
