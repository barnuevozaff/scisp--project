// src/utils/jwt.js
const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET;
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';

if (!SECRET) {
  console.warn('⚠ JWT_SECRET is not set in .env — using an insecure fallback. Set this before deploying.');
}

function signToken(payload) {
  return jwt.sign(payload, SECRET || 'insecure-dev-secret', { expiresIn: EXPIRES_IN });
}

function verifyToken(token) {
  return jwt.verify(token, SECRET || 'insecure-dev-secret');
}

module.exports = { signToken, verifyToken };
