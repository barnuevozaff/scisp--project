// src/routes/bookRoutes.js
const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { getBooks, getBookById } = require('../controllers/bookController');

const router = express.Router();

router.use(requireAuth);

router.get('/', getBooks);
router.get('/:id', getBookById);

module.exports = router;
