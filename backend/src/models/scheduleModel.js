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

  /** All schedule entries a given faculty member teaches. */
  async findForFaculty(facultyId, { search } = {}) {
    let sql = `
      SELECT sch.id, sub.subject_code, sub.description, sch.day_pattern, sch.start_time, sch.end_time,
             sch.room, sch.semester, sch.academic_year,
             (SELECT COUNT(*) FROM enrollments en WHERE en.schedule_id = sch.id) AS enrolled_count
      FROM schedules sch
      JOIN subjects sub ON sub.id = sch.subject_id
      WHERE sch.faculty_id = ?
    `;
    const params = [facultyId];
    if (search) {
      sql += ' AND (sub.subject_code LIKE ? OR sub.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    sql += ' ORDER BY sch.day_pattern, sch.start_time';
    const [rows] = await pool.query(sql, params);
    return rows;
  },

  /** Every schedule entry in the system — administrator view. */
  async findAll({ search } = {}) {
    let sql = `
      SELECT sch.id, sub.subject_code, sub.description, sch.day_pattern, sch.start_time, sch.end_time,
             sch.room, sch.semester, sch.academic_year,
             f.faculty_code, fu.full_name AS instructor_name
      FROM schedules sch
      JOIN subjects sub ON sub.id = sch.subject_id
      LEFT JOIN faculty f ON f.id = sch.faculty_id
      LEFT JOIN users fu ON fu.id = f.user_id
    `;
    const params = [];
    if (search) {
      sql += ' WHERE (sub.subject_code LIKE ? OR sub.description LIKE ?)';
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

  /**
   * Returns the ids of every schedule entry on record for the most recent
   * semester/academic year. Used to auto-enroll a newly registered student
   * into the standard curriculum offering — the same way a registrar would
   * batch-enroll an incoming class into that term's default course load.
   */
  async findCurrentTermScheduleIds() {
    const [latest] = await pool.query(
      `SELECT semester, academic_year FROM schedules
       ORDER BY academic_year DESC, semester DESC LIMIT 1`
    );
    if (!latest[0]) return [];

    const [rows] = await pool.query(
      `SELECT id FROM schedules WHERE semester = ? AND academic_year = ?`,
      [latest[0].semester, latest[0].academic_year]
    );
    return rows.map((r) => r.id);
  },

  /**
   * Enrolls a student into a list of schedule ids in one batch. Silently
   * skips any that are already enrolled rather than failing the whole
   * operation — this only ever runs once, right after account creation,
   * so duplicates aren't expected, but skipping is safer than throwing.
   */
  async enrollInSchedules(studentId, scheduleIds) {
    for (const scheduleId of scheduleIds) {
      try {
        await pool.query('INSERT INTO enrollments (student_id, schedule_id) VALUES (?, ?)', [
          studentId,
          scheduleId,
        ]);
      } catch (err) {
        if (err.code !== 'ER_DUP_ENTRY') throw err;
      }
    }
  },
};

module.exports = ScheduleModel;
