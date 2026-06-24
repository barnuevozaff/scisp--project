// src/services/authService.js
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const UserModel = require('../models/userModel');
const StudentModel = require('../models/studentModel');
const ScheduleModel = require('../models/scheduleModel');
const { signToken } = require('../utils/jwt');

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const googleClient = process.env.GOOGLE_CLIENT_ID ? new OAuth2Client(process.env.GOOGLE_CLIENT_ID) : null;

/**
 * Auto-enrolls a newly created student into the current term's standard
 * curriculum offering — mirroring how a registrar's office batch-enrolls
 * an incoming class, rather than leaving a brand-new account with an
 * empty class schedule. Failures here are logged but never thrown: a
 * hiccup in default enrollment should never prevent the account itself
 * from being created.
 */
async function autoEnrollNewStudent(studentPk) {
  try {
    const scheduleIds = await ScheduleModel.findCurrentTermScheduleIds();
    if (scheduleIds.length > 0) {
      await ScheduleModel.enrollInSchedules(studentPk, scheduleIds);
    }
  } catch (err) {
    console.error('Auto-enrollment failed for new student:', err.message);
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
      const studentPk = await StudentModel.create({
        userId,
        studentId: studentId || `2026-${String(userId).padStart(5, '0')}`,
        course: course || 'Undeclared',
        yearLevel: yearLevel || '1st Year',
        contactNumber: contactNumber || null,
      });
      await autoEnrollNewStudent(studentPk);
    }

    const token = signToken({ id: userId, role: role || 'student', email });
    return { token, user: { id: userId, fullName, email, role: role || 'student' } };
  },

  /**
   * Bonus feature: "Sign in with Google". Verifies the ID token the
   * frontend received from Google Identity Services, then either logs in
   * an existing account with that email or creates a new student account
   * on the spot (new Google sign-ins default to the student role — staff
   * accounts are still provisioned directly by an administrator).
   */
  async loginWithGoogle({ idToken }) {
    if (!googleClient) {
      throw new HttpError(500, 'Google sign-in is not configured on this server.');
    }

    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch {
      throw new HttpError(401, 'Could not verify this Google sign-in. Please try again.');
    }

    if (!payload?.email) {
      throw new HttpError(400, 'Your Google account did not provide an email address.');
    }
    if (payload.email_verified === false) {
      throw new HttpError(403, 'Your Google email address is not verified.');
    }

    let user = await UserModel.findByEmail(payload.email);

    if (!user) {
      // First time signing in with this Google account — provision a new
      // student account. The password field is required by the schema but
      // will never be used for a Google-only account, so we store a
      // random, unguessable hash rather than leaving it blank.
      const randomPassword = crypto.randomBytes(32).toString('hex');
      const passwordHash = await bcrypt.hash(randomPassword, 10);
      const fullName = payload.name || payload.email.split('@')[0];

      const userId = await UserModel.create({ fullName, email: payload.email, passwordHash, role: 'student' });
      const studentPk = await StudentModel.create({
        userId,
        studentId: `2026-${String(userId).padStart(5, '0')}`,
        course: 'Undeclared',
        yearLevel: '1st Year',
        contactNumber: null,
      });
      await autoEnrollNewStudent(studentPk);

      user = await UserModel.findByEmail(payload.email);
    }

    if (user.status !== 'active') {
      throw new HttpError(403, 'This account is not active. Contact the administrator.');
    }

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
};

module.exports = { AuthService, HttpError };
