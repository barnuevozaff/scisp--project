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
| Faculty | jreyes@scisp.edu                | Password123!   |
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
| POST   | `/auth/google`          | `{ idToken }`                                         | Bonus feature — verifies a Google ID token; auto-creates a student account on first sign-in |
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
| GET    | `/schedules?search=`   | any role   | Response shape depends on role: students get their own enrolled sections (`meta.totalUnits`), faculty get sections they teach (`meta.view: 'faculty'`, each row has `enrolled_count`), administrators get every section offered (`meta.view: 'administrator'`) |
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
| GET    | `/events/registrations/:id/qrcode`    | owner or staff | Returns a QR-code data URI (bonus feature) encoding the registration as an event "ticket" |
| POST   | `/events/register`                  | student     | `{ eventId }` — response includes `data.registrationId` |

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

## 7. Role-Aware Behavior

The same screens adapt to the signed-in role rather than branching into
separate apps:

| Area | Student | Faculty | Administrator |
|------|---------|---------|----------------|
| Sidebar "Profile" item | "Student Profile" — editable course/year/contact, avatar upload | "My Profile" — read-only directory summary (department, rank, consultation hours) | "My Profile" — read-only account summary |
| Schedule page | "Class Schedule" — own enrolled subjects, total units | "Teaching Schedule" — sections taught, enrolled headcount per section | "Schedule of Classes" — every section offered, with instructor |
| Announcements | Read-only list | Read + **New / Edit / Delete** | Read + **New / Edit / Delete** |
| Events | Read + **Register** | Read-only list | Read-only list |
| Dashboard stat card | "Enrolled Subjects" | "Sections Taught" | "Sections Offered" |

Backend enforcement: announcement writes (`POST/PUT/DELETE /announcements`)
are gated server-side with `requireRole('administrator', 'faculty')` —
the UI hiding the New/Edit/Delete buttons for students is a convenience,
not the security boundary. Event registration (`POST /events/register`)
requires a linked student profile regardless of what the client sends.

## 8. Bonus Features Implemented

Beyond the required modules, this project implements the following
optional bonus features from the project guidelines:

| Bonus Feature | Where it lives |
|----------------|------------------|
| **Mobile Responsive Design** | Every page uses Tailwind responsive breakpoints (`sm:`/`lg:`); the sidebar collapses to a hamburger-triggered overlay on small screens (`PortalLayout.jsx`, `Sidebar.jsx`). |
| **Google Login (OAuth)** | `POST /api/auth/google` verifies the Google ID token via `google-auth-library` and signs in (or auto-creates, on first sign-in) a student account. Frontend renders Google's own button via Google Identity Services (`GoogleSignInButton.jsx`) on both the Login and Register pages. Requires a free Google Cloud OAuth Client ID — see setup below. |
| **Email Notifications** | `backend/src/services/emailService.js`, via [Resend](https://resend.com) (free tier, no credit card). When a student registers for an event, a confirmation email is sent with the event details. Sent fire-and-forget so a slow/unreachable email provider never delays the registration response; quietly no-ops if `RESEND_API_KEY` isn't configured. |
| **QR Code Event Registration** | `GET /api/events/registrations/:id/qrcode` generates a scannable QR "ticket" (via the `qrcode` npm package) encoding the registration, event, and student details. Students can view/download it from the Events page after registering (`EventTicketModal.jsx`). |
| **Real-Time Notifications (WebSockets)** | Socket.io, authenticated with the same JWT as the REST API (`backend/src/socket.js`). When an admin/faculty member publishes a new announcement, every connected client sees it appear on the Announcements page instantly, with a "Live" indicator and a brief highlight — no refresh needed (`SocketContext.jsx`, `AnnouncementsPage.jsx`). |
| **CI/CD Pipeline** | `.github/workflows/ci.yml` — on every push/PR to `main`, GitHub Actions installs dependencies, syntax-checks the backend, and builds the frontend production bundle, catching breakages before they reach Vercel/Railway. |
| **Docker Containerization** | `backend/Dockerfile`, `frontend/Dockerfile` (multi-stage, served via nginx), and a root `docker-compose.yml` that runs the full stack (MySQL + backend + frontend) locally with one command — useful for local development/demo independent of the cloud deployment. |

### Setting up Email Notifications (free, ~3 minutes)

1. Sign up at [resend.com](https://resend.com) — free tier, no credit card needed.
2. Verify your email address, then go to **Dashboard → API Keys → Create API Key**.
3. Copy the key (starts with `re_`).
4. Set it as `RESEND_API_KEY` in the **backend** `.env`/Railway variables.
5. Leave `EMAIL_FROM` as the default `SCISP Events <onboarding@resend.dev>` — Resend's free tier lets you send from this address without owning a domain. (If you later verify your own domain with Resend, you can switch to a `@yourdomain.com` sender.)
6. Redeploy the backend. Registering for an event will now also send a confirmation email to the student's account email.

### Setting up Google OAuth (free, ~5 minutes)

1. Go to [console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials) (any free Google account works — no billing required for OAuth Client IDs).
2. Create a project if you don't have one, then **Create Credentials → OAuth client ID**.
3. Application type: **Web application**.
4. Under **Authorized JavaScript origins**, add both:
   - `http://localhost:5173` (local dev)
   - your deployed frontend URL, e.g. `https://your-app.vercel.app`
5. Copy the generated **Client ID** (looks like `123456-abc.apps.googleusercontent.com`).
6. Set it as `GOOGLE_CLIENT_ID` in the **backend** `.env`/Railway variables, and as `VITE_GOOGLE_CLIENT_ID` in the **frontend** `.env`/Vercel variables — same value in both places.
7. Redeploy both services. The "Continue with Google" button appears automatically on the Login and Register pages once the frontend variable is set; it's hidden if unset, so local development without it still works fine.

### Running the full stack with Docker (optional, local only)

```bash
docker compose up --build
```
- Frontend: `http://localhost:8080`
- Backend health check: `http://localhost:5000/api/health`

This is provided for local development and architecture demonstration.
The graded deployment remains Vercel (frontend) + Railway (backend) +
cloud MySQL, per the project's required deployment targets.

