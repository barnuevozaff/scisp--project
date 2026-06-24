// src/socket.js
// Real-time layer (bonus feature). Authenticated via the same JWT used by
// the REST API, so only signed-in users can receive live events. Kept as
// its own module (rather than wiring Socket.io directly in server.js) so
// controllers can import `emitToAll` / `emitToUser` without a circular
// dependency on server.js.
const { Server } = require('socket.io');
const { verifyToken } = require('./utils/jwt');

let io = null;

function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    },
  });

  // Authenticate the socket handshake using the same JWT issued at login.
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required.'));
    try {
      socket.user = verifyToken(token);
      next();
    } catch {
      next(new Error('Invalid or expired token.'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: user ${socket.user.id} (${socket.user.role})`);

    // Personal room so a specific user (e.g. an event organizer) can be
    // targeted directly without broadcasting to everyone.
    socket.join(`user:${socket.user.id}`);

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: user ${socket.user.id}`);
    });
  });

  return io;
}

/** Broadcast an event to every connected client. */
function emitToAll(event, payload) {
  if (!io) return;
  io.emit(event, payload);
}

/** Send an event to a single user's personal room. */
function emitToUser(userId, event, payload) {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, payload);
}

module.exports = { initSocket, emitToAll, emitToUser };
