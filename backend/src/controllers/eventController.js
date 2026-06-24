// src/controllers/eventController.js
const EventModel = require('../models/eventModel');
const StudentModel = require('../models/studentModel');
const { asyncHandler } = require('../middleware/errorHandler');

const getEvents = asyncHandler(async (req, res) => {
  const events = await EventModel.findAll();
  res.json({ success: true, data: events });
});

const getEventById = asyncHandler(async (req, res) => {
  const event = await EventModel.findById(req.params.id);
  if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });
  res.json({ success: true, data: event });
});

const registerForEvent = asyncHandler(async (req, res) => {
  const { eventId } = req.body;

  const event = await EventModel.findById(eventId);
  if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });

  const student = await StudentModel.findByUserId(req.user.id);
  if (!student) {
    return res.status(403).json({ success: false, message: 'Only students can register for events.' });
  }

  const existing = await EventModel.findRegistration(eventId, student.id);
  if (existing) {
    return res.status(409).json({ success: false, message: 'You are already registered for this event.' });
  }

  await EventModel.register({ eventId, studentId: student.id });
  res.status(201).json({ success: true, message: `Registered for "${event.event_name}".` });
});

const getMyRegistrations = asyncHandler(async (req, res) => {
  const student = await StudentModel.findByUserId(req.user.id);
  if (!student) return res.status(404).json({ success: false, message: 'No student profile linked to this account.' });
  const registrations = await EventModel.registrationsForStudent(student.id);
  res.json({ success: true, data: registrations });
});

module.exports = { getEvents, getEventById, registerForEvent, getMyRegistrations };
