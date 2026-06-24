// src/controllers/bookController.js
const BookModel = require('../models/bookModel');
const { asyncHandler } = require('../middleware/errorHandler');

const getBooks = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const books = await BookModel.findAll({ search });
  res.json({ success: true, data: books });
});

const getBookById = asyncHandler(async (req, res) => {
  const book = await BookModel.findById(req.params.id);
  if (!book) return res.status(404).json({ success: false, message: 'Book not found.' });
  res.json({ success: true, data: book });
});

module.exports = { getBooks, getBookById };
