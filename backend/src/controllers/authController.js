// src/controllers/authController.js
const { AuthService } = require('../services/authService');
const { asyncHandler } = require('../middleware/errorHandler');

const login = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;
  const result = await AuthService.login({ identifier, password });
  res.json({ success: true, message: 'Signed in successfully.', data: result });
});

const register = asyncHandler(async (req, res) => {
  const result = await AuthService.register(req.body);
  res.status(201).json({ success: true, message: 'Account created successfully.', data: result });
});

/**
 * JWTs are stateless, so "logout" is handled client-side by discarding the
 * token. This endpoint exists for API completeness and to give the client
 * a clear, auditable action to call.
 */
const logout = asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Signed out successfully.' });
});

module.exports = { login, register, logout };
