// src/controllers/facultyController.js
const FacultyModel = require('../models/facultyModel');
const { asyncHandler } = require('../middleware/errorHandler');

const getFaculty = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const faculty = await FacultyModel.findAll({ search });
  res.json({ success: true, data: faculty });
});

const getFacultyById = asyncHandler(async (req, res) => {
  const faculty = await FacultyModel.findById(req.params.id);
  if (!faculty) return res.status(404).json({ success: false, message: 'Faculty member not found.' });
  res.json({ success: true, data: faculty });
});

module.exports = { getFaculty, getFacultyById };
