const ws = require('ws');

// Maps to keep track of active connections
// socketId -> { ws, userId, projectId }
const clients = new Map();

let wss;

function initSocket(server) {
  wss = new ws.Server({ server });

  wss.on('connection', (socket) => {
    console.log('New WebSocket client connected.');
    const clientState = { ws: socket, userId: null, projectId: null };
    const socketId = Math.random().toString(36).substring(2, 9);
    clients.set(socketId, clientState);

    socket.on('message', (messageStr) => {
      try {
        const message = JSON.parse(messageStr);
        
        switch (message.type) {
          case 'JOIN_PROJECT':
            clientState.userId = message.userId;
            clientState.projectId = message.projectId;
            console.log(`User ${message.userId} joined project ${message.projectId}`);
            break;
            
          case 'LEAVE_PROJECT':
            console.log(`User ${clientState.userId} left project ${clientState.projectId}`);
            clientState.projectId = null;
            break;

          case 'PING':
            socket.send(JSON.stringify({ type: 'PONG' }));
            break;
            
          default:
            console.log(`Unknown socket message type: ${message.type}`);
        }
      } catch (err) {
        console.error('Error handling socket message:', err.message);
      }
    });

    socket.on('close', () => {
      console.log(`WebSocket client disconnected (ID: ${socketId}).`);
      clients.delete(socketId);
    });

    socket.on('error', (err) => {
      console.error(`Socket error: ${err.message}`);
    });
  });

  // Heartbeat check every 30 seconds
  setInterval(() => {
    clients.forEach((client, id) => {
      if (client.ws.readyState === ws.CLOSED) {
        clients.delete(id);
      }
    });
  }, 30000);
}

// Broadcast updates to all clients viewing a specific project
function broadcastToProject(projectId, messageObj) {
  if (!wss) return;
  const payload = JSON.stringify(messageObj);
  clients.forEach((client) => {
    if (client.projectId && Number(client.projectId) === Number(projectId)) {
      if (client.ws.readyState === ws.OPEN) {
        client.ws.send(payload);
      }
    }
  });
}

// Send real-time notification to a specific user if they are online
function sendNotificationToUser(userId, notificationObj) {
  if (!wss) return;
  const payload = JSON.stringify({
    type: 'NOTIFICATION_RECEIVED',
    notification: notificationObj
  });
  
  clients.forEach((client) => {
    if (client.userId && Number(client.userId) === Number(userId)) {
      if (client.ws.readyState === ws.OPEN) {
        client.ws.send(payload);
      }
    }
  });
}

module.exports = {
  initSocket,
  broadcastToProject,
  sendNotificationToUser
};
