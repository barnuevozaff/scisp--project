// src/routes/authRoutes.js
const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { login, register, logout } = require('../controllers/authController');

const router = express.Router();

router.post(
  '/login',
  [
    body('identifier').trim().notEmpty().withMessage('Student ID or email is required.'),
    body('password').notEmpty().withMessage('Password is required.'),
  ],
  validate,
  login
);

router.post(
  '/register',
  [
    body('fullName').trim().isLength({ min: 2 }).withMessage('Full name is required.'),
    body('email').isEmail().withMessage('A valid email is required.'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters.'),
    body('role').optional().isIn(['administrator', 'faculty', 'student']),
  ],
  validate,
  register
);

router.post('/logout', logout);

module.exports = router;
