// src/models/facultyModel.js
const { pool } = require('../config/db');

const FacultyModel = {
  async findAll({ search } = {}) {
    let sql = `
      SELECT f.id, f.faculty_code, f.rank_title, f.department, f.consultation_hours,
             u.full_name, u.email
      FROM faculty f
      JOIN users u ON u.id = f.user_id
    `;
    const params = [];
    if (search) {
      sql += ' WHERE u.full_name LIKE ? OR f.department LIKE ?';
      params.push(`%${search}%`, `%${search}%`);
    }
    sql += ' ORDER BY u.full_name ASC';
    const [rows] = await pool.query(sql, params);
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.query(
      `SELECT f.id, f.faculty_code, f.rank_title, f.department, f.consultation_hours,
              u.full_name, u.email
       FROM faculty f
       JOIN users u ON u.id = f.user_id
       WHERE f.id = ? LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  },
};

module.exports = FacultyModel;
