// src/controllers/scheduleController.js
const ScheduleModel = require('../models/scheduleModel');
const StudentModel = require('../models/studentModel');
const { asyncHandler } = require('../middleware/errorHandler');

const getSchedules = asyncHandler(async (req, res) => {
  // Students see their own enrolled schedule by default.
  const student = await StudentModel.findByUserId(req.user.id);
  if (!student) {
    return res.status(404).json({ success: false, message: 'No student profile linked to this account.' });
  }

  const { search } = req.query;
  const schedules = await ScheduleModel.findForStudent(student.id, { search });
  const totals = await ScheduleModel.totalUnitsForStudent(student.id);

  res.json({
    success: true,
    data: schedules,
    meta: {
      semester: schedules[0]?.semester || null,
      academicYear: schedules[0]?.academic_year || null,
      totalUnits: totals.total_units,
      subjectCount: totals.subject_count,
    },
  });
});

const getScheduleById = asyncHandler(async (req, res) => {
  const schedule = await ScheduleModel.findById(req.params.id);
  if (!schedule) return res.status(404).json({ success: false, message: 'Schedule entry not found.' });
  res.json({ success: true, data: schedule });
});

module.exports = { getSchedules, getScheduleById };
