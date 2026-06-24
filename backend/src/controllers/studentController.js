// src/controllers/studentController.js
const StudentModel = require('../models/studentModel');
const UserModel = require('../models/userModel');
const { asyncHandler } = require('../middleware/errorHandler');

const getStudents = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const students = await StudentModel.findAll({ search });
  res.json({ success: true, data: students });
});

/** Returns the student record linked to the currently authenticated user. */
const getMyProfile = asyncHandler(async (req, res) => {
  const student = await StudentModel.findByUserId(req.user.id);
  if (!student) {
    return res.status(404).json({ success: false, message: 'No student profile is linked to this account.' });
  }
  res.json({ success: true, data: student });
});

const getStudentById = asyncHandler(async (req, res) => {
  const student = await StudentModel.findById(req.params.id);
  if (!student) return res.status(404).json({ success: false, message: 'Student not found.' });
  res.json({ success: true, data: student });
});

const updateStudent = asyncHandler(async (req, res) => {
  const student = await StudentModel.findById(req.params.id);
  if (!student) return res.status(404).json({ success: false, message: 'Student not found.' });

  // A student may only edit their own profile; admins may edit any.
  if (req.user.role === 'student' && req.user.id !== student.user_id) {
    return res.status(403).json({ success: false, message: 'You can only edit your own profile.' });
  }

  const { course, yearLevel, contactNumber } = req.body;
  await StudentModel.update(req.params.id, { course, yearLevel, contactNumber });
  const updated = await StudentModel.findById(req.params.id);
  res.json({ success: true, message: 'Profile updated.', data: updated });
});

const uploadAvatar = asyncHandler(async (req, res) => {
  const student = await StudentModel.findById(req.params.id);
  if (!student) return res.status(404).json({ success: false, message: 'Student not found.' });

  if (req.user.role === 'student' && req.user.id !== student.user_id) {
    return res.status(403).json({ success: false, message: 'You can only update your own profile picture.' });
  }

  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No image file was uploaded.' });
  }

  const avatarUrl = `/uploads/${req.file.filename}`;
  await UserModel.updateAvatar(student.user_id, avatarUrl);

  res.json({ success: true, message: 'Profile picture updated.', data: { avatarUrl } });
});

module.exports = { getStudents, getMyProfile, getStudentById, updateStudent, uploadAvatar };
