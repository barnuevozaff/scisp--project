// src/routes/scheduleRoutes.js
const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { getSchedules, getScheduleById } = require('../controllers/scheduleController');

const router = express.Router();

router.use(requireAuth);

router.get('/', getSchedules);
router.get('/:id', getScheduleById);

module.exports = router;
