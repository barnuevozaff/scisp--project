// src/services/authService.js
const bcrypt = require('bcryptjs');
const UserModel = require('../models/userModel');
const StudentModel = require('../models/studentModel');
const { signToken } = require('../utils/jwt');

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const AuthService = {
  /**
   * Authenticates a user by email + password. Accepts a student ID as an
   * alternative identifier (the login screen advertises "Student ID or
   * University Email").
   */
  async login({ identifier, password }) {
    let user = await UserModel.findByEmail(identifier);

    if (!user) {
      // Maybe they typed a student ID instead of an email.
      const student = await StudentModel.findByStudentId(identifier);
      if (student) user = await UserModel.findByEmail(student.email);
    }

    if (!user) throw new HttpError(401, 'No account found with that ID or email.');
    if (user.status !== 'active') throw new HttpError(403, 'This account is not active. Contact the administrator.');

    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) throw new HttpError(401, 'Incorrect password.');

    const token = signToken({ id: user.id, role: user.role, email: user.email });

    return {
      token,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatar_url,
      },
    };
  },

  async register({ fullName, email, password, role, studentId, course, yearLevel, contactNumber }) {
    const existing = await UserModel.findByEmail(email);
    if (existing) throw new HttpError(409, 'An account with this email already exists.');

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = await UserModel.create({ fullName, email, passwordHash, role: role || 'student' });

    if ((role || 'student') === 'student') {
      await StudentModel.create({
        userId,
        studentId: studentId || `2026-${String(userId).padStart(5, '0')}`,
        course: course || 'Undeclared',
        yearLevel: yearLevel || '1st Year',
        contactNumber: contactNumber || null,
      });
    }

    const token = signToken({ id: userId, role: role || 'student', email });
    return { token, user: { id: userId, fullName, email, role: role || 'student' } };
  },
};

module.exports = { AuthService, HttpError };
