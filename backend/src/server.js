// src/server.js
require('dotenv').config();
const fs = require('fs');
const app = require('./app');
const { verifyConnection } = require('./config/db');

const PORT = process.env.PORT || 5000;

// Ensure the uploads directory exists (profile picture uploads).
const uploadDir = process.env.UPLOAD_DIR || 'uploads';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

(async () => {
  await verifyConnection();
  app.listen(PORT, () => {
    console.log(`🚀 SCISP API listening on http://localhost:${PORT}`);
    console.log(`   Health check: http://localhost:${PORT}/api/health`);
  });
})();
