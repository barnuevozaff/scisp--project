// database/seed.js
// Populates the database with demo data matching the reference UI
// (Marian R. Velasco, CS 311, faculty directory, library catalog, events…).
//
// Run with: npm run seed   (after schema.sql has been applied)

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool } = require('../src/config/db');

async function seed() {
  const conn = await pool.getConnection();
  try {
    console.log('Seeding SCISP demo data…');
    await conn.beginTransaction();

    // Wipe existing demo rows (idempotent re-seed)
    await conn.query('SET FOREIGN_KEY_CHECKS = 0');
    for (const t of [
      'event_registrations', 'events', 'books', 'announcements',
      'enrollments', 'schedules', 'subjects', 'faculty', 'students', 'users',
    ]) {
      await conn.query(`TRUNCATE TABLE ${t}`);
    }
    await conn.query('SET FOREIGN_KEY_CHECKS = 1');

    const passwordHash = await bcrypt.hash('Password123!', 10);

    // ── Users ──────────────────────────────────────────────
    const [adminUser] = await conn.query(
      `INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, 'administrator')`,
      ['Office of the University Registrar', 'admin@scisp.edu.ph', passwordHash]
    );

    const [studentUser] = await conn.query(
      `INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, 'student')`,
      ['Marian R. Velasco', 'richardnasol709@gmail.com', passwordHash]
    );

    const facultyRoster = [
      ['Dr. Jonathan A. Reyes', 'jreyes@scisp.edu', 'DJA', 'Associate Professor', 'Computer Science', 'Tue, Thu · 14:00–16:00'],
      ['Prof. Maria L. Cruz', 'mcruz@scisp.edu', 'PML', 'Assistant Professor', 'Computer Science', 'Mon, Wed · 10:00–12:00'],
      ['Dr. Liwayway G. Tan', 'ltan@scisp.edu', 'DLG', 'Professor', 'Mathematics', 'Wed, Fri · 13:00–15:00'],
      ['Prof. Roberto V. Aquino', 'raquino@scisp.edu', 'PRV', 'Senior Lecturer', 'Philosophy', 'Tue · 09:00–12:00'],
      ['Prof. Karen B. Domingo', 'kdomingo@scisp.edu', 'PKB', 'Lecturer', 'English & Literature', 'Thu · 13:00–16:00'],
      ['Dr. Eduardo M. Santos', 'esantos@scisp.edu', 'DEM', 'Department Chair', 'Economics', 'Mon, Fri · 14:00–16:00'],
      ['Prof. Anna P. Villanueva', 'avillanueva@scisp.edu', 'PAP', 'Assistant Professor', 'History', 'Wed · 10:00–12:00'],
      ['Dr. Patricio E. del Rosario', 'pdelrosario@scisp.edu', 'DPE', 'Professor', 'Physics', 'Tue, Thu · 15:00–17:00'],
    ];

    const facultyIds = {};
    for (const [name, email, code, rankTitle, dept, hours] of facultyRoster) {
      const [u] = await conn.query(
        `INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, 'faculty')`,
        [name, email, passwordHash]
      );
      const [f] = await conn.query(
        `INSERT INTO faculty (user_id, faculty_code, rank_title, department, consultation_hours) VALUES (?, ?, ?, ?, ?)`,
        [u.insertId, code, rankTitle, dept, hours]
      );
      facultyIds[code] = f.insertId;
    }

    // ── Student profile ────────────────────────────────────
    const [studentRow] = await conn.query(
      `INSERT INTO students (user_id, student_id, course, year_level, contact_number) VALUES (?, ?, ?, ?, ?)`,
      [studentUser.insertId, '2024-00831', 'BS Computer Science', '3rd Year', '+63 917 555 0142']
    );
    const studentPk = studentRow.insertId;

    // ── Subjects + Schedules ───────────────────────────────
    const subjectRows = [
      ['CS 311', 'Design and Analysis of Algorithms', 3.0, 'DJA', 'MWF', '09:00:00', '10:30:00', 'Engg. Hall 204'],
      ['CS 322', 'Database Management Systems', 3.0, 'PML', 'TTh', '10:30:00', '12:00:00', 'Engg. Hall 311'],
      ['MATH 211', 'Discrete Structures II', 3.0, 'DLG', 'MWF', '13:00:00', '14:00:00', 'Faculty Bldg. 102'],
      ['PHIL 101', 'Ethics and the Modern Citizen', 3.0, 'PRV', 'TTh', '15:00:00', '16:30:00', 'Humanities 210'],
      ['ENG 213', 'Technical and Academic Writing', 3.0, 'PKB', 'F', '14:00:00', '17:00:00', 'Library Seminar Rm A'],
      ['PE 04', 'Individual & Dual Sports', 2.0, null, 'S', '08:00:00', '11:00:00', 'Athletics Complex'],
    ];

    for (const [code, desc, units, facCode, days, start, end, room] of subjectRows) {
      const [subj] = await conn.query(
        `INSERT INTO subjects (subject_code, description, units) VALUES (?, ?, ?)`,
        [code, desc, units]
      );
      const [sched] = await conn.query(
        `INSERT INTO schedules (subject_id, faculty_id, day_pattern, start_time, end_time, room, semester, academic_year)
         VALUES (?, ?, ?, ?, ?, ?, 'First Semester', '2024-2025')`,
        [subj.insertId, facCode ? facultyIds[facCode] : null, days, start, end, room]
      );
      await conn.query(
        `INSERT INTO enrollments (student_id, schedule_id) VALUES (?, ?)`,
        [studentPk, sched.insertId]
      );
    }

    // ── Announcements ──────────────────────────────────────
    const announcements = [
      ['Midterm Examination Schedule — First Semester AY 2024–2025',
        'The Office of the University Registrar has released the official midterm examination schedule. Students are advised to verify their respective examination rooms through the portal.',
        'Academic', 'Office of the University Registrar', '2024-10-14 09:00:00'],
      ['Scholarship Renewal Forms Now Available',
        'Renewal applications for the University Merit Scholarship are now open. Submit accomplished forms to the Office of Student Affairs on or before October 30.',
        'Student Affairs', 'Office of Student Affairs', '2024-10-12 09:00:00'],
      ["Founders' Week — Opening Convocation",
        "The University community is cordially invited to the opening convocation of Founders' Week. The program will be held at the Main Auditorium.",
        'Events', 'University Events Office', '2024-10-10 09:00:00'],
      ['Library Extended Hours During Examination Period',
        'The University Library will observe extended operating hours during the examination period to accommodate student review sessions.',
        'General Information', 'University Library', '2024-10-08 09:00:00'],
    ];
    for (const [title, body, category, postedBy, publishedAt] of announcements) {
      await conn.query(
        `INSERT INTO announcements (title, body, category, posted_by, author_id, published_at) VALUES (?, ?, ?, ?, ?, ?)`,
        [title, body, category, postedBy, adminUser.insertId, publishedAt]
      );
    }

    // ── Library books ──────────────────────────────────────
    const books = [
      ['Introduction to the Theory of Computation', 'Michael Sipser', 'Computer Science', 'AVAILABLE'],
      ['The Pragmatic Programmer', 'Hunt & Thomas', 'Software Engineering', 'ON LOAN'],
      ['Discrete Mathematics and Its Applications', 'Kenneth H. Rosen', 'Mathematics', 'AVAILABLE'],
      ['A History of Western Philosophy', 'Bertrand Russell', 'Philosophy', 'AVAILABLE'],
      ['Database System Concepts', 'Silberschatz, Korth & Sudarshan', 'Computer Science', 'ON LOAN'],
      ['Norton Anthology of English Literature', 'Stephen Greenblatt', 'Literature', 'AVAILABLE'],
      ['Principles of Economics', 'N. Gregory Mankiw', 'Economics', 'AVAILABLE'],
      ['The Structure of Scientific Revolutions', 'Thomas S. Kuhn', 'Philosophy of Science', 'ON LOAN'],
    ];
    for (const [title, author, category, availability] of books) {
      await conn.query(
        `INSERT INTO books (title, author, category, availability) VALUES (?, ?, ?, ?)`,
        [title, author, category, availability]
      );
    }

    // ── Events ──────────────────────────────────────────────
    const events = [
      ["Founders' Week Opening Convocation",
        "Formal opening of the University Founders' Week with academic procession and keynote address.",
        '2024-10-21 09:00:00', 'Main Auditorium', 'Office of the President'],
      ['Annual Research Symposium',
        'Presentation of selected undergraduate and graduate research projects across disciplines.',
        '2024-10-24 13:00:00', 'Library Conference Hall', 'Office of Research'],
      ['University Choir Concert',
        'An evening of sacred and secular choral works performed by the University Choir.',
        '2024-10-27 19:00:00', 'Recital Hall', 'Department of Music'],
      ['Career Fair 2024',
        'Meet with over forty partner companies offering internships and career opportunities.',
        '2024-10-30 10:00:00', 'Gymnasium', 'Office of Student Affairs'],
    ];
    for (const [name, desc, date, venue, organizer] of events) {
      await conn.query(
        `INSERT INTO events (event_name, description, event_date, venue, organizer) VALUES (?, ?, ?, ?, ?)`,
        [name, desc, date, venue, organizer]
      );
    }

    await conn.commit();
    console.log('✔ Seed complete.');
    console.log('  Student login:  richardnasol709@gmail.com / Password123!');
    console.log('  Admin login:    admin@scisp.edu.ph / Password123!');
  } catch (err) {
    await conn.rollback();
    console.error('✘ Seed failed:', err);
  } finally {
    conn.release();
    process.exit(0);
  }
}

seed();
