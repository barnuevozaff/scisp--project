# SCISP — Smart Campus Integrated Services Portal

A full-stack university portal: React frontend, Express/Node REST API,
MySQL database, JWT authentication with role-based access control.

```
scisp/
├── frontend/   React + Vite + Tailwind (UI)
└── backend/    Node + Express + MySQL (API)
```

---

## 1. System Architecture

```
┌──────────────┐      HTTPS/JSON       ┌───────────────────┐      SQL      ┌─────────────┐
│   Browser     │ ───────────────────▶ │   Express API     │ ───────────▶ │   MySQL      │
│  React (Vite) │ ◀─────────────────── │  (Node.js)         │ ◀─────────── │  Database    │
└──────────────┘     REST endpoints    └───────────────────┘   mysql2     └─────────────┘
                                              │
                                  ┌───────────┴───────────┐
                                  │  routes → controllers  │
                                  │  → services → models   │
                                  └─────────────────────────┘
```

- **Frontend** — React 18, React Router 6, Tailwind CSS, Axios. Talks to the
  API only via `VITE_API_URL`.
- **Backend** — Express 4, organized as `routes → controllers → services → models`.
  JWT auth (`jsonwebtoken`) + `bcryptjs` password hashing + `express-validator`
  input validation + `helmet`/`cors` hardening.
- **Database** — MySQL 8, one table per module (users, students, faculty,
  subjects, schedules, enrollments, announcements, books, events,
  event_registrations). See `backend/database/schema.sql`.

---

## 2. Run Locally

### Prerequisites
- Node.js 18+
- MySQL 8+ (via XAMPP, MySQL Workbench/Server, Docker, or a cloud instance)

### Step 1 — Database

**Option A: Local MySQL (XAMPP / MySQL Workbench / mysql-server)**

```bash
# Start your local MySQL server, then:
mysql -u root -p < backend/database/schema.sql
```
Or open `backend/database/schema.sql` in MySQL Workbench / phpMyAdmin and run it.

**Option B: Cloud MySQL (Railway, PlanetScale, Aiven, AWS RDS, etc.)**
1. Create a MySQL instance with your provider and copy its host/port/user/password/database.
2. Connect with any MySQL client and run `backend/database/schema.sql`.

### Step 2 — Backend

```bash
cd backend
cp .env.example .env
# Edit .env: set DB_HOST, DB_USER, DB_PASSWORD, DB_NAME (and DB_SSL=true for most cloud providers)
# Also set JWT_SECRET to a long random string.

npm install
npm run seed     # populates demo data (Marian R. Velasco, faculty, books, events…)
npm run dev       # starts on http://localhost:5000
```

Confirm it's running: open `http://localhost:5000/api/health` — you should see
`{"success":true,"message":"SCISP API is running."}`.

**Demo accounts created by the seed script:**
| Role    | Email                         | Password      |
|---------|--------------------------------|----------------|
| Student | richardnasol709@gmail.com      | Password123!   |
| Admin   | admin@scisp.edu.ph              | Password123!   |

(Login also accepts the student ID `2024-00831` in place of the email.)

### Step 3 — Frontend

```bash
cd frontend
cp .env.example .env
# Edit .env if your API isn't on http://localhost:5000/api

npm install
npm run dev       # starts on http://localhost:5173
```

Open `http://localhost:5173/login` and sign in with the demo account above.

---

## 3. API Documentation

Base URL: `http://localhost:5000/api` (or your deployed backend URL)

All endpoints except `/auth/login`, `/auth/register`, `/auth/logout`, and
`/health` require an `Authorization: Bearer <token>` header.

### Auth

| Method | Endpoint              | Body                                              | Notes                         |
|--------|-----------------------|----------------------------------------------------|--------------------------------|
| POST   | `/auth/login`          | `{ identifier, password }`                          | `identifier` = email or student ID |
| POST   | `/auth/register`       | `{ fullName, email, password, role?, studentId?, course?, yearLevel? }` | `role` defaults to `student` |
| POST   | `/auth/logout`         | —                                                    | Stateless; discard token client-side |

### Students
| Method | Endpoint              | Auth          | Notes |
|--------|-----------------------|----------------|-------|
| GET    | `/students?search=`    | any role        | List/search students |
| GET    | `/students/me`           | any role        | Current user's own student record |
| GET    | `/students/:id`         | any role        | Single student |
| PUT    | `/students/:id`         | owner or admin  | `{ course, yearLevel, contactNumber }` |
| POST   | `/students/:id/avatar`  | owner or admin  | multipart/form-data, field `avatar` |

### Schedules
| Method | Endpoint              | Auth     | Notes |
|--------|-----------------------|-----------|-------|
| GET    | `/schedules?search=`   | any role   | Current user's enrolled schedule |
| GET    | `/schedules/:id`        | any role   | Single schedule entry |

### Announcements
| Method | Endpoint                   | Auth                     | Notes |
|--------|------------------------------|---------------------------|-------|
| GET    | `/announcements?category=`   | any role                   | Filter by category |
| GET    | `/announcements/:id`          | any role                   | |
| POST   | `/announcements`               | administrator, faculty      | `{ title, body, category, postedBy? }` |
| PUT    | `/announcements/:id`            | administrator, faculty      | |
| DELETE | `/announcements/:id`            | administrator, faculty      | |

Valid `category` values: `Academic`, `Student Affairs`, `Events`, `General Information`.

### Library
| Method | Endpoint         | Auth     | Notes |
|--------|-------------------|-----------|-------|
| GET    | `/books?search=`   | any role   | Search by title/author/category |
| GET    | `/books/:id`         | any role   | |

### Faculty Directory
| Method | Endpoint           | Auth     | Notes |
|--------|----------------------|-----------|-------|
| GET    | `/faculty?search=`    | any role   | Search by name/department |
| GET    | `/faculty/:id`           | any role   | |

### Events
| Method | Endpoint                     | Auth     | Notes |
|--------|---------------------------------|-----------|-------|
| GET    | `/events`                        | any role   | |
| GET    | `/events/:id`                      | any role   | |
| GET    | `/events/registrations/mine`        | any role   | Current student's registrations |
| POST   | `/events/register`                  | student     | `{ eventId }` |

### Response shape
```json
{ "success": true, "message": "...", "data": { } }
{ "success": false, "message": "...", "errors": [ { "field": "...", "message": "..." } ] }
```

---

## 4. Security

- Passwords hashed with **bcrypt** (10 salt rounds).
- **JWT** bearer tokens, 8-hour expiry by default (`JWT_EXPIRES_IN`).
- **Role-based access control** middleware (`requireRole`) restricts writes
  (e.g. announcements) to `administrator`/`faculty`.
- **express-validator** on every write endpoint.
- **helmet** sets secure HTTP headers; **cors** restricts origins to `CLIENT_URL`.
- Students may only edit their own profile (`requireAuth` + ownership check
  in the controller).

---

## 5. Deployment

### Frontend → Vercel or Netlify
```bash
cd frontend
npm run build        # outputs to dist/
```
- **Vercel**: import the repo, set root directory to `frontend`, build command
  `npm run build`, output directory `dist`. Add env var `VITE_API_URL` pointing
  to your deployed backend, e.g. `https://your-api.onrender.com/api`.
- **Netlify**: same build command/output dir; set the env var in
  Site settings → Environment variables.

### Backend → Render or Railway
- **Render**: New → Web Service → connect repo → root directory `backend` →
  build command `npm install` → start command `npm start`. Add all variables
  from `.env.example` in the Environment tab (use your cloud MySQL credentials).
- **Railway**: New Project → deploy from repo → set root directory `backend` →
  Railway auto-detects `npm start`. Add the same env vars; if you provision
  Railway's MySQL plugin, copy its connection variables into `DB_HOST`,
  `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` and set `DB_SSL=true`.

### Database → Cloud MySQL
Any MySQL 8-compatible host works (Railway MySQL, PlanetScale, Aiven, AWS RDS).
After provisioning, run `backend/database/schema.sql` against it once, then
optionally `npm run seed` (point `.env` at the cloud DB first) for demo data.

### Post-deploy checklist
- [ ] `JWT_SECRET` is a long random value (not the example placeholder)
- [ ] `CLIENT_URL` on the backend matches your deployed frontend's exact origin
- [ ] `VITE_API_URL` on the frontend points at the deployed backend's `/api` path
- [ ] Database schema applied; seed data loaded if you want demo accounts
- [ ] HTTPS enabled on both frontend and backend (Vercel/Netlify/Render/Railway do this by default)

---

## 6. Module Coverage

| Module                     | Status |
|-----------------------------|---------|
| Authentication (JWT, RBAC)   | ✅ |
| Student Profile Management   | ✅ |
| Class Schedule                | ✅ |
| Announcement System (CRUD)    | ✅ |
| Library Information           | ✅ |
| Faculty Directory              | ✅ |
| Event Registration              | ✅ |
