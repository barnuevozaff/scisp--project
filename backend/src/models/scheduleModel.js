// src/models/scheduleModel.js
const { pool } = require('../config/db');

const ScheduleModel = {
  /** All schedules a given student is enrolled in. */
  async findForStudent(studentId, { search } = {}) {
    let sql = `
      SELECT sch.id, sub.subject_code, sub.description, sch.day_pattern, sch.start_time, sch.end_time,
             sch.room, sch.semester, sch.academic_year,
             f.faculty_code, fu.full_name AS instructor_name
      FROM enrollments e
      JOIN schedules sch ON sch.id = e.schedule_id
      JOIN subjects sub ON sub.id = sch.subject_id
      LEFT JOIN faculty f ON f.id = sch.faculty_id
      LEFT JOIN users fu ON fu.id = f.user_id
      WHERE e.student_id = ?
    `;
    const params = [studentId];
    if (search) {
      sql += ' AND (sub.subject_code LIKE ? OR sub.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    sql += ' ORDER BY sch.day_pattern, sch.start_time';
    const [rows] = await pool.query(sql, params);
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.query(
      `SELECT sch.id, sub.subject_code, sub.description, sch.day_pattern, sch.start_time, sch.end_time,
              sch.room, sch.semester, sch.academic_year,
              f.faculty_code, fu.full_name AS instructor_name
       FROM schedules sch
       JOIN subjects sub ON sub.id = sch.subject_id
       LEFT JOIN faculty f ON f.id = sch.faculty_id
       LEFT JOIN users fu ON fu.id = f.user_id
       WHERE sch.id = ? LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  },

  /** Total units a student is currently enrolled in. */
  async totalUnitsForStudent(studentId) {
    const [rows] = await pool.query(
      `SELECT COALESCE(SUM(sub.units), 0) AS total_units, COUNT(*) AS subject_count
       FROM enrollments e
       JOIN schedules sch ON sch.id = e.schedule_id
       JOIN subjects sub ON sub.id = sch.subject_id
       WHERE e.student_id = ?`,
      [studentId]
    );
    return rows[0];
  },
};

module.exports = ScheduleModel;
