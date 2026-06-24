// src/routes/eventRoutes.js
const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');
const {
  getEvents,
  getEventById,
  registerForEvent,
  getMyRegistrations,
  getRegistrationQrCode,
} = require('../controllers/eventController');

const router = express.Router();

router.use(requireAuth);

router.get('/', getEvents);
router.get('/registrations/mine', getMyRegistrations);
router.get('/registrations/:id/qrcode', getRegistrationQrCode);
router.get('/:id', getEventById);
router.post(
  '/register',
  [body('eventId').isInt().withMessage('A valid eventId is required.')],
  validate,
  registerForEvent
);

module.exports = router;
