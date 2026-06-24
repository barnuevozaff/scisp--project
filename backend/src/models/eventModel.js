// src/models/eventModel.js
const { pool } = require('../config/db');

const EventModel = {
  async findAll() {
    const [rows] = await pool.query('SELECT * FROM events ORDER BY event_date ASC');
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM events WHERE id = ? LIMIT 1', [id]);
    return rows[0] || null;
  },

  async register({ eventId, studentId }) {
    const [result] = await pool.query(
      'INSERT INTO event_registrations (event_id, student_id) VALUES (?, ?)',
      [eventId, studentId]
    );
    return result.insertId;
  },

  async findRegistration(eventId, studentId) {
    const [rows] = await pool.query(
      'SELECT * FROM event_registrations WHERE event_id = ? AND student_id = ? LIMIT 1',
      [eventId, studentId]
    );
    return rows[0] || null;
  },

  async registrationsForStudent(studentId) {
    const [rows] = await pool.query(
      `SELECT er.id AS registration_id, er.status, er.registered_at,
              ev.id, ev.event_name, ev.description, ev.event_date, ev.venue, ev.organizer
       FROM event_registrations er
       JOIN events ev ON ev.id = er.event_id
       WHERE er.student_id = ?
       ORDER BY ev.event_date ASC`,
      [studentId]
    );
    return rows;
  },

  /**
   * A single registration by its own id, joined with event + student info.
   * Used to verify ownership and to render the QR-code "ticket".
   */
  async findRegistrationById(registrationId) {
    const [rows] = await pool.query(
      `SELECT er.id AS registration_id, er.status, er.registered_at, er.student_id,
              ev.event_name, ev.event_date, ev.venue, ev.organizer,
              s.student_id AS student_number, u.full_name AS student_name
       FROM event_registrations er
       JOIN events ev ON ev.id = er.event_id
       JOIN students s ON s.id = er.student_id
       JOIN users u ON u.id = s.user_id
       WHERE er.id = ? LIMIT 1`,
      [registrationId]
    );
    return rows[0] || null;
  },
};

module.exports = EventModel;
