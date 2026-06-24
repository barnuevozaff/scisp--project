// src/routes/studentRoutes.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');
const {
  getStudents,
  getMyProfile,
  getStudentById,
  updateStudent,
  uploadAvatar,
} = require('../controllers/studentController');

const router = express.Router();

router.use(requireAuth);

// ── Avatar upload (multer disk storage) ─────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, process.env.UPLOAD_DIR || 'uploads'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `avatar-${req.user.id}-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: (Number(process.env.MAX_UPLOAD_MB) || 5) * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.png', '.jpg', '.jpeg', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowed.includes(ext)) return cb(new Error('Only PNG, JPG, or WEBP images are allowed.'));
    cb(null, true);
  },
});

router.get('/', getStudents);
router.get('/me', getMyProfile);
router.get('/:id', getStudentById);
router.put(
  '/:id',
  [
    body('course').optional().trim().notEmpty(),
    body('yearLevel').optional().trim().notEmpty(),
    body('contactNumber').optional().trim(),
  ],
  validate,
  updateStudent
);
router.post('/:id/avatar', upload.single('avatar'), uploadAvatar);

module.exports = router;
