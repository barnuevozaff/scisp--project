// src/models/announcementModel.js
const { pool } = require('../config/db');

const AnnouncementModel = {
  async findAll({ category } = {}) {
    let sql = 'SELECT * FROM announcements';
    const params = [];
    if (category) {
      sql += ' WHERE category = ?';
      params.push(category);
    }
    sql += ' ORDER BY published_at DESC';
    const [rows] = await pool.query(sql, params);
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM announcements WHERE id = ? LIMIT 1', [id]);
    return rows[0] || null;
  },

  async create({ title, body, category, postedBy, authorId }) {
    const [result] = await pool.query(
      'INSERT INTO announcements (title, body, category, posted_by, author_id) VALUES (?, ?, ?, ?, ?)',
      [title, body, category, postedBy, authorId]
    );
    return result.insertId;
  },

  async update(id, { title, body, category, postedBy }) {
    await pool.query(
      'UPDATE announcements SET title = ?, body = ?, category = ?, posted_by = ? WHERE id = ?',
      [title, body, category, postedBy, id]
    );
  },

  async remove(id) {
    await pool.query('DELETE FROM announcements WHERE id = ?', [id]);
  },
};

module.exports = AnnouncementModel;
