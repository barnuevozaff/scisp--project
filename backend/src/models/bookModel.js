// src/models/bookModel.js
const { pool } = require('../config/db');

const BookModel = {
  async findAll({ search } = {}) {
    let sql = 'SELECT * FROM books';
    const params = [];
    if (search) {
      sql += ' WHERE title LIKE ? OR author LIKE ? OR category LIKE ?';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    sql += ' ORDER BY title ASC';
    const [rows] = await pool.query(sql, params);
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM books WHERE id = ? LIMIT 1', [id]);
    return rows[0] || null;
  },

  async create({ title, author, category, availability = 'AVAILABLE', isbn }) {
    const [result] = await pool.query(
      'INSERT INTO books (title, author, category, availability, isbn) VALUES (?, ?, ?, ?, ?)',
      [title, author, category, availability, isbn]
    );
    return result.insertId;
  },

  async updateAvailability(id, availability) {
    await pool.query('UPDATE books SET availability = ? WHERE id = ?', [availability, id]);
  },
};

module.exports = BookModel;
