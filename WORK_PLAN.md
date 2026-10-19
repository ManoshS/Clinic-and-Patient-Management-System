# Work Plan & Progress Report
## Smart Patient & Clinical Record Management System
**BITS Pilani WILP | SESAP ZC337 – Database Systems and Applications**
**Last Updated: 18 October 2026**

---

## 1. Project Overview

| Field | Details |
|---|---|
| Problem Statement | Smart Patient & Clinical Record Management System (Problem 1) |
| Term 1 Scope | Structured relational database + REST API + React UI with role-based access |
| Term 2 Scope | Multimodal extension (images, ECG, lab reports, audio) |
| Architecture | User → React SPA → FastAPI → PostgreSQL → FastAPI → React SPA → User |
| Deployment | Docker + CI/CD pipeline |

---

## 2. Delivery Schedule

| Lab Session | Date | Deliverable | Status |
|---|---|---|---|
| Session 1 | 26 Sept 2026 | Work Plan + SRS (draft) | **Completed** |
| Session 2 | 17 Oct 2026 | Prototype + SRS (final) | **Completed** |
| Session 3 | 28 Nov 2026 | MVP demo | Pending |

---

## 3. Phase 1 Work Plan (Term 1)

### 3.1 Milestone Breakdown

| Milestone | Tasks | Target | Status |
|---|---|---|---|
| **M1 – Design** | ER/EER diagram, schema design, normalization to 3NF | Week 1–2 | ✅ Done |
| **M2 – Database** | DDL scripts (9 tables), seed data, 16 indexes, 2 views | Week 3–4 | ✅ Done |
| **M3 – Auth** | `user_account` table, JWT login, role-based access (admin/patient) | Week 4–5 | In Progress |
| **M4 – Backend** | 18 REST endpoints (FastAPI + PostgreSQL), parameterized SQL, RBAC middleware | Week 5–6 | In Progress |
| **M5 – Frontend** | React (TypeScript) SPA — Login, Admin Console, Patient Portal | Week 7–8 | In Progress |
| **M6 – CI/CD** | GitHub Actions: build → test → Docker image → deploy | Week 9 | Pending |
| **M7 – SRS + Demo** | Finalize SRS v1.2, run MVP demo | Week 10 (28 Nov) | Pending |

### 3.2 Current Progress (as of 18 Oct 2026)

| Area | Done |
|---|---|
| Problem statement selected | ✅ |
| Domain entities identified (9 entities incl. USER_ACCOUNT) | ✅ |
| ER diagram | ✅ — `er_diagram.eraser` |
| Schema DDL (3NF/BCNF, 9 tables, 16 indexes, 2 views) | ✅ |
| Seed data | ✅ |
| SRS document v1.2 | ✅ — `SRS.md` |
| FastAPI backend with RBAC | In progress |
| React frontend (TypeScript) | In progress |
| CI/CD pipeline | Not started |

---

## 4. System Architecture

```
User (Browser)
 |
 v
React SPA (TypeScript + Vite)         <-- Login, Admin Console, Patient Portal
 |   Bearer JWT on every request
 v
FastAPI Backend (Python)              <-- 18 endpoints, Pydantic validation,
 |   psycopg2 / asyncpg                   RBAC middleware, auto OpenAPI /docs
 v
PostgreSQL Database                   <-- 9 tables, 16 indexes, 2 views
```

**Role flow:**
```
POST /auth/login
  → validate password_hash (bcrypt)
  → issue JWT {user_id, role: "admin"|"patient", patient_id?}
  → role="patient"  → redirect to Patient Portal (read-only own data)
  → role="admin"    → redirect to Admin Console (full CRUD all data)
```

**Deployment:**
```
git push main
  --> GitHub Actions (checkout → pytest → npm build → Docker build)
      --> Docker Compose: web (FastAPI :8000) + db (PostgreSQL :5432)
```

---

## 5. Entities (Final Schema)

| Entity | Key Attributes |
|---|---|
| PATIENT | patient_id (PK), name, dob, gender, blood_group, contact, address, registered_at |
| HEALTHCARE_PROFESSIONAL | hp_id (PK), name, specialization, role, dept_id (FK), contact |
| DEPARTMENT | dept_id (PK), dept_name, location, head_hp_id (FK, nullable) |
| APPOINTMENT | appt_id (PK), patient_id (FK), hp_id (FK), scheduled_dt, actual_dt, status, notes |
| DIAGNOSIS | diag_id (PK), appt_id (FK), icd_code, description, severity |
| PRESCRIPTION | rx_id (PK), diag_id (FK), hp_id (FK), medication, dosage, frequency, duration_days |
| LAB_INVESTIGATION | lab_id (PK), patient_id (FK), ordered_by (FK→hp_id), test_name, result, status |
| CLINICAL_RECORD | record_id (PK), patient_id (FK), hp_id (FK), visit_date, chief_complaint, notes, type |
| USER_ACCOUNT | user_id (PK), username, password_hash, role (admin/patient), patient_id (FK, nullable), hp_id (FK, nullable) |

---

## 6. Screens (Frontend — React TypeScript)

| Screen | Role | Description |
|---|---|---|
| **S0 – Login** | All | Username + password → JWT → role-based redirect |
| **S1 – Admin Dashboard** | Admin | Stats cards, recent appointments, department overview |
| **S2 – Patient Management** | Admin | Register, search, edit patients (full CRUD) |
| **S3 – Appointment Management** | Admin | Book, update, cancel appointments; filter by date/doctor/status |
| **S4 – Lab Investigations (Admin)** | Admin | Submit and update lab results for any patient |
| **S5 – Clinical Records (Admin)** | Admin | View all clinical records; drill into a patient's history |
| **S6 – Patient Portal – Timeline** | Patient | Own appointments with diagnosis + prescription details |
| **S7 – Patient Portal – Labs** | Patient | Own lab results with reference ranges and status |
| **S8 – Patient Portal – Records** | Patient | Own clinical visit notes |
| **S9 – AI Chat Assistant** | Patient | Sidebar assistant that summarises own records and next steps |

---

## 7. REST API Endpoints (FastAPI)

| Method | Endpoint | Admin | Patient |
|---|---|---|---|
| POST | /auth/login | ✅ | ✅ |
| POST | /auth/logout | ✅ | ✅ |
| GET | /patients | ✅ | ❌ |
| GET | /patients/{id} | ✅ | ✅ own |
| POST | /patients | ✅ | ❌ |
| PUT | /patients/{id} | ✅ | ❌ |
| GET | /appointments | ✅ | ❌ |
| GET | /appointments?patient_id={id} | ✅ | ✅ own |
| POST | /appointments | ✅ | ❌ |
| PUT | /appointments/{id} | ✅ | ❌ |
| DELETE | /appointments/{id} | ✅ | ❌ |
| GET | /clinical-records/{patient_id} | ✅ | ✅ own |
| POST | /diagnoses | ✅ | ❌ |
| POST | /prescriptions | ✅ | ❌ |
| GET | /lab-investigations/{patient_id} | ✅ | ✅ own |
| GET | /lab-investigations | ✅ | ❌ |
| POST | /lab-investigations | ✅ | ❌ |
| PUT | /lab-investigations/{id} | ✅ | ❌ |
| GET | /stats | ✅ | ❌ |
| GET | /departments | ✅ | ❌ |
| GET | /healthcare-professionals | ✅ | ❌ |

---

## 8. Technology Stack

| Layer | Choice | Rationale |
|---|---|---|
| Database | PostgreSQL | Strong constraint support, ACID compliance |
| Backend | Python + FastAPI | Async support, auto OpenAPI docs, Pydantic validation, fast |
| Frontend | React (TypeScript) + Vite | Component-based, type-safe, modern clinical UI |
| UI Library | shadcn/ui + Tailwind CSS | Accessible, unstyled primitives, fully customisable |
| Auth | JWT (`python-jose`) + bcrypt (`passlib`) | Stateless, standard, secure password storage |
| DB Driver | psycopg2 / asyncpg | Standard PostgreSQL Python drivers |
| CI/CD | GitHub Actions | Free, integrates with git push |
| Containerization | Docker + Docker Compose | Single-VM deployment |

---

## 9. Folder Structure (New)

```
DBMS-Project/
├── backend/             # FastAPI application
│   ├── main.py          # App entry point, CORS, router registration
│   ├── auth.py          # JWT creation, password hashing, login endpoint
│   ├── dependencies.py  # get_current_user(), require_admin() FastAPI deps
│   ├── routes/          # One file per domain (patients, appointments, labs…)
│   ├── models.py        # Pydantic request/response schemas
│   ├── db.py            # psycopg2 connection pool
│   ├── schema.sql       # Full DDL + indexes + views
│   └── requirements.txt
├── frontend/            # React TypeScript SPA
│   ├── src/
│   │   ├── pages/       # Login, AdminDashboard, PatientPortal…
│   │   ├── components/  # Shared UI (cards, tables, modals, nav)
│   │   ├── api/         # fetch wrappers per domain
│   │   ├── hooks/       # useAuth, usePatient…
│   │   └── types.ts     # TypeScript interfaces matching API responses
│   ├── package.json
│   └── vite.config.ts
├── SRS.md
├── WORK_PLAN.md
└── er_diagram.eraser
```

---

## 10. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Schema changes late in cycle | Finalize ER before writing DDL; use ALTER TABLE for incremental changes |
| JWT secret exposure | Store in environment variable; never commit to git |
| CORS misconfiguration between React (port 5173) and FastAPI (port 8000) | Set `origins` in FastAPI `CORSMiddleware` explicitly |
| Patient accessing another patient's data via URL manipulation | Server-side JWT claim check on every patient-scoped endpoint |
| CI/CD unfamiliarity | Use GitHub Actions starter template; add `pytest` + `npm run build` checks |

---

## 11. Division of Work

*(To be filled per team member if group project)*

| Member | Area |
|---|---|
| [Name/ID] | DB design, DDL, normalization, `user_account` schema |
| [Name/ID] | FastAPI backend — auth, RBAC, all endpoints |
| [Name/ID] | React frontend — Login, Admin Console |
| [Name/ID] | React frontend — Patient Portal, AI chat; CI/CD pipeline |

---

*Document last updated: 18 October 2026*
*Next update: Lab Session 3 — 28 November 2026*
