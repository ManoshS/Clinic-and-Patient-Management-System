# ClinIQ — Smart Patient Management System

A full-stack clinical management system with a FastAPI backend and React TypeScript frontend.

## Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL (running locally on port 5432)

---

## Database Setup

1. Create the database and load the schema:

```bash
psql -U postgres -c "CREATE DATABASE cliniq;"
psql -U postgres -d cliniq -f backend/schema.sql
```

This creates all tables, indexes, views, and seeds demo data (patients, appointments, lab results, etc.).

---

## Backend (FastAPI)

### 1. Create and activate a virtual environment

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # macOS/Linux
# .venv\Scripts\activate         # Windows
```

### 2. Install dependencies

```bash
pip install fastapi uvicorn[standard] psycopg2-binary python-jose bcrypt python-dotenv
```

### 3. Configure environment

The `.env` file is already present in `backend/`. It contains:

```
DATABASE_URL=postgresql://postgres:Manosh%402004@localhost:5432/cliniq
JWT_SECRET=cliniq_jwt_secret_change_in_production
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=480
```

> **Note:** The `@` in the database password is URL-encoded as `%40`.

### 4. Run the server

```bash
uvicorn main:app --reload
```

Backend runs at **http://localhost:8000**  
API docs (Swagger UI) at **http://localhost:8000/docs**

---

## Frontend (React + Vite)

### 1. Install dependencies

```bash
cd frontend
npm install
```

### 2. Run the dev server

```bash
npm run dev
```

Frontend runs at **http://localhost:5173**

> The backend must be running before starting the frontend.

---

## Demo Credentials

| Role    | Username      | Password      |
|---------|---------------|---------------|
| Admin   | `admin`       | `Admin@1234`  |
| Patient | `rahul.verma` | `Patient@1234` |
| Patient | `priti.nair`  | `Patient@1234` |

---

## Features

**Admin dashboard:**
- View stats (total patients, appointments, pending labs)
- Manage patients — add, edit, search
- Manage appointments — book, edit, filter by status/doctor, cancel
- Lab investigations — order tests, enter results
- Clinical records — view per-patient visit history

**Patient portal:**
- My Timeline — appointment history with expandable diagnosis and prescriptions
- My Labs — lab results with reference ranges
- My Records — clinical visit notes

---

## Project Structure

```
DBMS-Project/
├── backend/
│   ├── main.py              # FastAPI app, CORS, router mounts
│   ├── auth.py              # JWT login/logout/me endpoints
│   ├── db.py                # PostgreSQL connection pool
│   ├── dependencies.py      # Auth guards (get_current_user, require_admin)
│   ├── models.py            # Pydantic request models
│   ├── schema.sql           # Full DDL + seed data
│   ├── routes/              # One file per resource
│   │   ├── patients.py
│   │   ├── appointments.py
│   │   ├── diagnoses.py
│   │   ├── prescriptions.py
│   │   ├── labs.py
│   │   ├── clinical_records.py
│   │   ├── stats.py
│   │   ├── departments.py
│   │   └── professionals.py
│   └── .env                 # DB URL + JWT secret (not committed)
└── frontend/
    ├── src/
    │   ├── api/             # Typed fetch wrappers for every endpoint
    │   ├── components/      # Layout, StatusBadge, StatCard, ProtectedRoute
    │   ├── hooks/           # useAuth (AuthContext + JWT decode)
    │   ├── pages/
    │   │   ├── admin/       # Dashboard, Patients, Appointments, Labs, Records
    │   │   └── patient/     # Timeline, Labs, Records
    │   ├── types.ts         # Shared TypeScript interfaces
    │   └── App.tsx          # Routes + AuthProvider
    └── vite.config.ts
```
