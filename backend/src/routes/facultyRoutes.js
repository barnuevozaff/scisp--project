// src/routes/facultyRoutes.js
const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { getFaculty, getFacultyById } = require('../controllers/facultyController');

const router = express.Router();

router.use(requireAuth);

router.get('/', getFaculty);
router.get('/:id', getFacultyById);

module.exports = router;
