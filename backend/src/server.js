// src/server.js
require('dotenv').config();
const fs = require('fs');
const http = require('http');
const app = require('./app');
const { verifyConnection } = require('./config/db');
const { initSocket } = require('./socket');

const PORT = process.env.PORT || 5000;

// Ensure the uploads directory exists (profile picture uploads).
const uploadDir = process.env.UPLOAD_DIR || 'uploads';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Socket.io needs a raw http.Server instance (not just the Express app)
// so it can upgrade connections to WebSockets on the same port.
const httpServer = http.createServer(app);
initSocket(httpServer);

(async () => {
  await verifyConnection();
  httpServer.listen(PORT, () => {
    console.log(`🚀 SCISP API listening on http://localhost:${PORT}`);
    console.log(`   Health check: http://localhost:${PORT}/api/health`);
    console.log(`   Real-time (Socket.io) ready on the same port.`);
  });
})();
