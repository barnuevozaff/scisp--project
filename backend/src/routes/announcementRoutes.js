// src/routes/announcementRoutes.js
const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { requireAuth, requireRole } = require('../middleware/auth');
const {
  getAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} = require('../controllers/announcementController');

const router = express.Router();

const categoryValues = ['Academic', 'Student Affairs', 'Events', 'General Information'];

// Public reads require only a valid session (any authenticated role).
router.get('/', requireAuth, getAnnouncements);
router.get('/:id', requireAuth, getAnnouncementById);

// Writes are restricted to administrator/faculty.
router.post(
  '/',
  requireAuth,
  requireRole('administrator', 'faculty'),
  [
    body('title').trim().notEmpty().withMessage('Title is required.'),
    body('body').trim().notEmpty().withMessage('Body is required.'),
    body('category').isIn(categoryValues).withMessage(`Category must be one of: ${categoryValues.join(', ')}`),
  ],
  validate,
  createAnnouncement
);

router.put(
  '/:id',
  requireAuth,
  requireRole('administrator', 'faculty'),
  [body('category').optional().isIn(categoryValues)],
  validate,
  updateAnnouncement
);

router.delete('/:id', requireAuth, requireRole('administrator', 'faculty'), deleteAnnouncement);

module.exports = router;
