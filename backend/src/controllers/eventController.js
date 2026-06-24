// src/controllers/eventController.js
const QRCode = require('qrcode');
const EventModel = require('../models/eventModel');
const StudentModel = require('../models/studentModel');
const { asyncHandler } = require('../middleware/errorHandler');
const { sendEventRegistrationEmail } = require('../services/emailService');

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

  const registrationId = await EventModel.register({ eventId, studentId: student.id });

  // Bonus feature: email confirmation. Fired without awaiting so a slow or
  // unreachable email provider never delays the registration response —
  // the registration itself has already succeeded by this point.
  sendEventRegistrationEmail({
    to: student.email,
    studentName: student.full_name,
    eventName: event.event_name,
    eventDate: event.event_date,
    venue: event.venue,
    organizer: event.organizer,
  }).catch(() => {
    // sendEventRegistrationEmail already logs its own failures internally;
    // this catch only exists to guarantee the unawaited promise never
    // surfaces as an unhandled rejection.
  });

  res.status(201).json({
    success: true,
    message: `Registered for "${event.event_name}".`,
    data: { registrationId },
  });
});

const getMyRegistrations = asyncHandler(async (req, res) => {
  const student = await StudentModel.findByUserId(req.user.id);
  if (!student) return res.status(404).json({ success: false, message: 'No student profile linked to this account.' });
  const registrations = await EventModel.registrationsForStudent(student.id);
  res.json({ success: true, data: registrations });
});

/**
 * GET /api/events/registrations/:id/qrcode
 * Returns a QR code (as a data URI) encoding this registration's details,
 * so it can be displayed/scanned as an event entry ticket. Restricted to
 * the student who owns the registration, or staff (admin/faculty).
 */
const getRegistrationQrCode = asyncHandler(async (req, res) => {
  const registration = await EventModel.findRegistrationById(req.params.id);
  if (!registration) {
    return res.status(404).json({ success: false, message: 'Registration not found.' });
  }

  if (req.user.role === 'student') {
    const student = await StudentModel.findByUserId(req.user.id);
    if (!student || student.id !== registration.student_id) {
      return res.status(403).json({ success: false, message: 'You can only view your own event ticket.' });
    }
  }

  // Encode a compact, human-checkable payload — not a secret, just a
  // scannable confirmation of the registration for door staff to verify.
  const payload = JSON.stringify({
    registrationId: registration.registration_id,
    event: registration.event_name,
    student: registration.student_name,
    studentId: registration.student_number,
    status: registration.status,
  });

  const dataUri = await QRCode.toDataURL(payload, { width: 280, margin: 1 });

  res.json({
    success: true,
    data: {
      qrCode: dataUri,
      registration: {
        id: registration.registration_id,
        eventName: registration.event_name,
        eventDate: registration.event_date,
        venue: registration.venue,
        studentName: registration.student_name,
        studentId: registration.student_number,
        status: registration.status,
      },
    },
  });
});

module.exports = { getEvents, getEventById, registerForEvent, getMyRegistrations, getRegistrationQrCode };
