// src/models/studentModel.js
const { pool } = require('../config/db');

const StudentModel = {
  async findAll({ search } = {}) {
    let sql = `
      SELECT s.id, s.student_id, s.course, s.year_level, s.contact_number,
             u.id AS user_id, u.full_name, u.email, u.avatar_url
      FROM students s
      JOIN users u ON u.id = s.user_id
    `;
    const params = [];
    if (search) {
      sql += ' WHERE u.full_name LIKE ? OR s.student_id LIKE ?';
      params.push(`%${search}%`, `%${search}%`);
    }
    sql += ' ORDER BY u.full_name ASC';
    const [rows] = await pool.query(sql, params);
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.query(
      `SELECT s.id, s.student_id, s.course, s.year_level, s.contact_number,
              u.id AS user_id, u.full_name, u.email, u.avatar_url
       FROM students s
       JOIN users u ON u.id = s.user_id
       WHERE s.id = ? LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  },

  async findByStudentId(studentId) {
    const [rows] = await pool.query(
      `SELECT s.id, s.student_id, s.course, s.year_level, s.contact_number,
              u.id AS user_id, u.full_name, u.email, u.avatar_url
       FROM students s
       JOIN users u ON u.id = s.user_id
       WHERE s.student_id = ? LIMIT 1`,
      [studentId]
    );
    return rows[0] || null;
  },

  async findByUserId(userId) {
    const [rows] = await pool.query(
      `SELECT s.id, s.student_id, s.course, s.year_level, s.contact_number,
              u.id AS user_id, u.full_name, u.email, u.avatar_url
       FROM students s
       JOIN users u ON u.id = s.user_id
       WHERE s.user_id = ? LIMIT 1`,
      [userId]
    );
    return rows[0] || null;
  },

  async update(id, { course, yearLevel, contactNumber }) {
    await pool.query(
      'UPDATE students SET course = ?, year_level = ?, contact_number = ? WHERE id = ?',
      [course, yearLevel, contactNumber, id]
    );
  },

  async create({ userId, studentId, course, yearLevel, contactNumber }) {
    const [result] = await pool.query(
      'INSERT INTO students (user_id, student_id, course, year_level, contact_number) VALUES (?, ?, ?, ?, ?)',
      [userId, studentId, course, yearLevel, contactNumber]
    );
    return result.insertId;
  },
};

module.exports = StudentModel;
