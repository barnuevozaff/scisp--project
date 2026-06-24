-- ============================================================
-- SCISP — Smart Campus Integrated Services Portal
-- Database Schema (MySQL 8+)
-- ============================================================
-- Run with:
--   mysql -u root -p < database/schema.sql
-- or paste into MySQL Workbench / phpMyAdmin SQL tab.
-- ============================================================

CREATE DATABASE IF NOT EXISTS scisp_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE scisp_db;

-- ────────────────────────────────────────────────────────────
-- 1. USERS  (Authentication + Role-Based Access Control)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  full_name       VARCHAR(150)  NOT NULL,
  email           VARCHAR(150)  NOT NULL UNIQUE,
  password_hash   VARCHAR(255)  NOT NULL,
  role            ENUM('administrator', 'faculty', 'student') NOT NULL DEFAULT 'student',
  status          ENUM('active', 'inactive', 'suspended') NOT NULL DEFAULT 'active',
  avatar_url      VARCHAR(255)  NULL,
  created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────
-- 2. STUDENTS  (Student Profile Management)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS students (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id         INT UNSIGNED NOT NULL,
  student_id      VARCHAR(20)  NOT NULL UNIQUE,        -- e.g. 2024-00831
  course          VARCHAR(100) NOT NULL,               -- e.g. BS Computer Science
  year_level      VARCHAR(20)  NOT NULL,               -- e.g. 3rd Year
  contact_number  VARCHAR(30)  NULL,
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_students_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────
-- 3. FACULTY  (Faculty Directory)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS faculty (
  id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id             INT UNSIGNED NOT NULL,
  faculty_code        VARCHAR(20)  NOT NULL UNIQUE,    -- initials shown in directory, e.g. DJA
  rank_title          VARCHAR(100) NOT NULL,           -- e.g. Associate Professor, Senior Lecturer
  department          VARCHAR(100) NOT NULL,           -- e.g. Computer Science
  consultation_hours  VARCHAR(150) NULL,               -- e.g. "Tue, Thu · 14:00–16:00"
  created_at          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_faculty_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────
-- 4. SUBJECTS  (catalog of offerable subjects)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subjects (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  subject_code  VARCHAR(20)  NOT NULL UNIQUE,   -- e.g. CS 311
  description   VARCHAR(200) NOT NULL,          -- e.g. Design and Analysis of Algorithms
  units         DECIMAL(3,1) NOT NULL DEFAULT 3.0,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────
-- 5. SCHEDULES  (Class Schedule Module)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS schedules (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  subject_id      INT UNSIGNED NOT NULL,
  faculty_id      INT UNSIGNED NULL,
  section         VARCHAR(20)  NULL,
  day_pattern     VARCHAR(20)  NOT NULL,         -- e.g. MWF, TTh, S
  start_time      TIME         NOT NULL,
  end_time        TIME         NOT NULL,
  room            VARCHAR(100) NOT NULL,
  semester        VARCHAR(50)  NOT NULL,         -- e.g. First Semester
  academic_year   VARCHAR(20)  NOT NULL,         -- e.g. 2024-2025
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_schedules_subject FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
  CONSTRAINT fk_schedules_faculty FOREIGN KEY (faculty_id) REFERENCES faculty(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Many-to-many: which students are enrolled in which schedule/section
CREATE TABLE IF NOT EXISTS enrollments (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  student_id    INT UNSIGNED NOT NULL,
  schedule_id   INT UNSIGNED NOT NULL,
  enrolled_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_enroll_student  FOREIGN KEY (student_id)  REFERENCES students(id)  ON DELETE CASCADE,
  CONSTRAINT fk_enroll_schedule FOREIGN KEY (schedule_id) REFERENCES schedules(id) ON DELETE CASCADE,
  UNIQUE KEY uq_student_schedule (student_id, schedule_id)
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────
-- 6. ANNOUNCEMENTS  (Announcement System)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS announcements (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title         VARCHAR(200) NOT NULL,
  body          TEXT         NOT NULL,
  category      ENUM('Academic', 'Student Affairs', 'Events', 'General Information') NOT NULL,
  posted_by     VARCHAR(150) NOT NULL,         -- office/department display name
  author_id     INT UNSIGNED NULL,             -- user who created it
  published_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_announcements_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────
-- 7. BOOKS  (Library Information Module)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS books (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title         VARCHAR(255) NOT NULL,
  author        VARCHAR(150) NOT NULL,
  category      VARCHAR(100) NOT NULL,
  availability  ENUM('AVAILABLE', 'ON LOAN') NOT NULL DEFAULT 'AVAILABLE',
  isbn          VARCHAR(30)  NULL,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────
-- 8. EVENTS  (Event Registration Module)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS events (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  event_name    VARCHAR(200) NOT NULL,
  description   TEXT         NULL,
  event_date    DATETIME     NOT NULL,
  venue         VARCHAR(150) NOT NULL,
  organizer     VARCHAR(150) NOT NULL,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS event_registrations (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  event_id      INT UNSIGNED NOT NULL,
  student_id    INT UNSIGNED NOT NULL,
  status        ENUM('registered', 'attended', 'cancelled') NOT NULL DEFAULT 'registered',
  registered_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_eventreg_event   FOREIGN KEY (event_id)   REFERENCES events(id)   ON DELETE CASCADE,
  CONSTRAINT fk_eventreg_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  UNIQUE KEY uq_event_student (event_id, student_id)
) ENGINE=InnoDB;

-- ────────────────────────────────────────────────────────────
-- Helpful indexes
-- ────────────────────────────────────────────────────────────
CREATE INDEX idx_announcements_category ON announcements(category);
CREATE INDEX idx_books_category ON books(category);
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_schedules_subject ON schedules(subject_id);
