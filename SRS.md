# Software Requirements Specification (SRS)
## Smart Patient & Clinical Record Management System

**Version:** 1.0 (Draft)
**Course:** SESAP ZC337 – Database Systems and Applications, BITS Pilani WILP
**Prepared by:** [Name, ID]
**Date:** 26 September 2026
**Standard:** IEEE 830 / ISO/IEC/IEEE 29148

---

## Table of Contents

1. [Introduction](#1-introduction)
   - 1.1 Purpose
   - 1.2 Scope
   - 1.3 Definitions, Acronyms, and Abbreviations
   - 1.4 References
2. [Overall Description](#2-overall-description)
   - 2.1 Product Perspective
   - 2.2 Product Functions
   - 2.3 User Characteristics
   - 2.4 Constraints
   - 2.5 Assumptions and Dependencies
3. [Specific Requirements](#3-specific-requirements)
   - 3.1 Functional Requirements
   - 3.2 Non-Functional Requirements
   - 3.3 Domain Requirements
4. [Database Design](#4-database-design)
   - 4.1 Entity and Attribute Definitions
   - 4.2 ER/EER Diagram Description
   - 4.3 Relational Schema (DDL)
   - 4.4 Normalization Process
   - 4.5 Indexes
   - 4.6 Views
   - 4.7 Data Dictionary
5. [Frontend Requirements](#5-frontend-requirements)
   - 5.1 Screen List
   - 5.2 Screen Specifications
6. [Backend Specifications](#6-backend-specifications)
   - 6.1 REST API Endpoints
   - 6.2 Database Connectivity
7. [System Features](#7-system-features)
   - 7.1 Data Integrity
   - 7.2 Analytical Queries
8. [External Interface Requirements](#8-external-interface-requirements)
9. [Performance Requirements](#9-performance-requirements)
10. [Validation and Verification](#10-validation-and-verification)
11. [Appendix](#11-appendix)
    - 11.1 Assumptions and System Constraints
    - 11.2 Future Enhancements (Term 2)
    - 11.3 Document History

---

## 1. Introduction

### 1.1 Purpose

This Software Requirements Specification (SRS) defines the complete requirements for the **Smart Patient & Clinical Record Management System**, a relational database application designed to manage patients, healthcare professionals, appointments, diagnoses, prescriptions, laboratory investigations, and clinical records.

The document specifies functional and non-functional requirements, database schema design (normalized to 3NF/BCNF), REST API specifications, frontend screens, CI/CD pipeline requirements, and validation tests. It serves as the reference for development, demonstration, and evaluation during Term 1 (SESAP ZC337).

### 1.2 Scope

The system automates core clinical data management for a healthcare facility. Term 1 scope covers a structured relational database with a minimal end-to-end application:

- Register and manage patient records
- Schedule and track appointments with healthcare professionals
- Record diagnoses and prescriptions per appointment
- Track laboratory investigations and results
- Maintain clinical visit records per patient
- Expose data via REST APIs to a simple web frontend
- Support analytical reporting queries (joins, aggregates, views)

**Out of scope for Term 1:** medical images, ECG/audio data, PDF lab reports, mobile app, authentication beyond basic session (Term 2 scope).

### 1.3 Definitions, Acronyms, and Abbreviations

| Term | Meaning |
|---|---|
| DBMS | Database Management System |
| SRS | Software Requirements Specification |
| DDL | Data Definition Language |
| DML | Data Manipulation Language |
| PK | Primary Key |
| FK | Foreign Key |
| SQL | Structured Query Language |
| REST | Representational State Transfer |
| API | Application Programming Interface |
| RDBMS | Relational Database Management System |
| 3NF | Third Normal Form |
| BCNF | Boyce-Codd Normal Form |
| ICD | International Classification of Diseases (diagnosis codes) |
| MVP | Minimal Viable Product |
| CI/CD | Continuous Integration / Continuous Deployment |
| ER | Entity-Relationship |
| EER | Extended Entity-Relationship |
| FR | Functional Requirement |
| NFR | Non-Functional Requirement |

### 1.4 References

- IEEE 830-1998, ISO/IEC/IEEE 29148:2018
- Elmasri & Navathe, *Fundamentals of Database Systems*, 7th Ed.
- BITS Pilani WILP Lab Handout, SESAP ZC337, Ver 1.0, 23-9-26b
- BITS Pilani WILP Reference SRS Document, SESAP ZC337

---

## 2. Overall Description

### 2.1 Product Perspective

The system is a relational database application running on a standard RDBMS (PostgreSQL). It is accessed through a modern React (TypeScript) frontend communicating with a Python/FastAPI REST API backend. The database is the primary technical focus; the frontend and backend exist to demonstrate end-to-end connectivity and CRUD operations.

**System flow:**
```
User → React Frontend → FastAPI (REST) → PostgreSQL → FastAPI → React Frontend → User
```

### 2.2 Product Functions

- Register, search, and update patient demographic records
- Manage healthcare professional profiles and department assignments
- Book, update, and cancel appointments
- Record and retrieve diagnoses (with ICD codes) per appointment
- Create and retrieve prescriptions linked to diagnoses
- Submit and query laboratory investigation results
- Maintain and retrieve clinical visit records
- Generate analytical reports using multi-table joins and aggregates

### 2.3 User Characteristics

The system supports two application-level roles stored in the `user_account` table:

| Role | Description | Permitted Actions |
|---|---|---|
| `admin` | Clinical staff (receptionists, doctors, lab technicians, analysts) with full system access | Create / read / update / delete patients, appointments, diagnoses, prescriptions, lab investigations, clinical records; view all reports and analytics |
| `patient` | Registered patient accessing their own portal | Read-only access to their own appointments, diagnoses, prescriptions, lab results, and clinical records; no access to other patients' data |

> **Note:** The `role` field in `user_account` is distinct from the `role` field in `healthcare_professional` (which describes clinical function: doctor / nurse / technician). A user account links either to a patient or to a healthcare professional depending on who is logging in.

### 2.4 Constraints

- The database must be in Third Normal Form (3NF) or higher
- All referential integrity constraints must be enforced through foreign keys
- The backend must use parameterized SQL (no string-concatenated queries)
- Frontend must be React (TypeScript) with a clean, modern UI — no plain HTML pages
- Backend must be FastAPI (Python) exposing REST APIs returning JSON, with automatic OpenAPI documentation
- Role-based access control must be enforced server-side via JWT; the frontend role check is UX-only and must not be the sole security gate
- Every `git push` must trigger the CI pipeline

### 2.5 Assumptions and Dependencies

- Each patient has a unique patient ID (system-generated)
- Each appointment is between exactly one patient and one healthcare professional
- Each diagnosis is linked to exactly one appointment
- Each prescription is linked to exactly one diagnosis
- Each healthcare professional belongs to exactly one department
- A lab investigation is ordered by one healthcare professional for one patient
- The system depends on PostgreSQL as the underlying RDBMS
- Deployment is to a single VM or Docker Compose environment (no Kubernetes)

---

## 3. Specific Requirements

### 3.1 Functional Requirements

| ID | Requirement |
|---|---|
| FR1 | The system shall store patient details: patient_id, full name, date of birth, gender, blood group, contact number, address, registration date. |
| FR2 | The system shall store healthcare professional details: hp_id, full name, specialization, role (doctor/nurse/technician), department_id, contact. |
| FR3 | The system shall store department details: dept_id, dept_name, location, head_hp_id. |
| FR4 | The system shall record appointments: appt_id, patient_id, hp_id, scheduled date/time, actual date/time, status (scheduled/completed/cancelled), notes. |
| FR5 | The system shall record diagnoses linked to appointments: diag_id, appt_id, icd_code, description, severity. |
| FR6 | The system shall record prescriptions linked to diagnoses: rx_id, diag_id, hp_id, medication_name, dosage, frequency, duration, notes. |
| FR7 | The system shall record laboratory investigations: lab_id, patient_id, ordered_by (FK→hp_id), test_name, test_date, result_value, result_unit, reference_range, status. |
| FR8 | The system shall record clinical visit records: record_id, patient_id, hp_id, visit_date, chief_complaint, clinical_notes, record_type. |
| FR9 | The system shall enforce referential integrity between all related entities. |
| FR10 | The system shall support patient search by name, ID, or contact number. |
| FR11 | The system shall support appointment listing filtered by date, doctor, or status. |
| FR12 | The system shall allow updating appointment status (scheduled → completed / cancelled). |
| FR13 | The system shall support retrieval of full clinical history for a patient (appointments, diagnoses, prescriptions, lab results). |
| FR14 | The system shall support analytical queries: patient count per department, diagnosis frequency, average lab result per test type. |
| FR15 | The system shall support view creation for reporting (e.g., PATIENT_CLINICAL_SUMMARY joining patient, appointment, diagnosis, prescription). |
| FR16 | The system shall use indexes on all FK columns to support performant joins. |
| FR17 | The system shall expose all core operations as REST API endpoints returning JSON. |
| FR18 | The system shall validate all API inputs and return structured error responses. |
| FR19 | The system shall maintain a `user_account` table storing login credentials and role (`admin` / `patient`) for every application user. |
| FR20 | The system shall enforce role-based access control: a `patient` role user may only read records belonging to their own patient_id; an `admin` role user may perform all CRUD operations across all records. |
| FR21 | The system shall link each `user_account` to either a `patient` record (via patient_id FK) or a `healthcare_professional` record (via hp_id FK), with exactly one of the two set. |
| FR22 | The system shall reject any API request that attempts to access another patient's data when the authenticated role is `patient`. |

### 3.2 Non-Functional Requirements

| ID | Category | Requirement |
|---|---|---|
| NFR1 | Performance | Single-table queries on ≤ 1,000 records shall complete within 2 seconds. |
| NFR2 | Performance | Multi-table joins across ≤ 5 tables on ≤ 1,000 records shall complete within 3 seconds. |
| NFR3 | Security | Only authorized roles may modify patient or clinical data. The backend must use parameterized SQL to prevent SQL injection. |
| NFR4 | Reliability | The database shall prevent orphan records via FK constraints and ON DELETE RESTRICT where appropriate. |
| NFR5 | Scalability | The schema shall support up to 100,000 patients and 1,000,000 appointment records without schema changes. |
| NFR6 | Maintainability | Schema changes shall require only DDL ALTER statements with no application-layer rewrites. |
| NFR7 | Backup & Recovery | Full database backup and restore procedures must be documented and testable. |
| NFR8 | Normalization | The schema shall be in 3NF minimum; BCNF where feasible. |
| NFR9 | Portability | The application shall run in Docker on any Linux-based host. |
| NFR10 | CI/CD | Every git push to the main branch shall trigger the CI pipeline (build, test, validate). |

### 3.3 Domain Requirements

- ICD codes used in diagnoses must conform to ICD-10 format (letter + 2–5 digits, e.g., J18.9)
- Appointment date/time must not be in the past when booking
- A prescription's duration must be a positive integer (days)
- Lab result status must be one of: `pending`, `completed`, `cancelled`
- Appointment status must be one of: `scheduled`, `completed`, `cancelled`
- A patient's date of birth must be before the registration date

---

## 4. Database Design

### 4.1 Entity and Attribute Definitions

```
PATIENT(patient_id, first_name, last_name, dob, gender, blood_group, contact, address, registered_at)

DEPARTMENT(dept_id, dept_name, location, head_hp_id)

HEALTHCARE_PROFESSIONAL(hp_id, first_name, last_name, specialization, role, dept_id, contact)

APPOINTMENT(appt_id, patient_id, hp_id, scheduled_dt, actual_dt, status, notes)

DIAGNOSIS(diag_id, appt_id, icd_code, description, severity)

PRESCRIPTION(rx_id, diag_id, hp_id, medication_name, dosage, frequency, duration_days, notes)

LAB_INVESTIGATION(lab_id, patient_id, ordered_by, test_name, test_date, result_value, result_unit, reference_range, status)

CLINICAL_RECORD(record_id, patient_id, hp_id, visit_date, chief_complaint, clinical_notes, record_type)

USER_ACCOUNT(user_id, username, password_hash, role, patient_id, hp_id, created_at, is_active)
```

### 4.2 ER/EER Diagram Description

**Entities:** PATIENT, DEPARTMENT, HEALTHCARE_PROFESSIONAL, APPOINTMENT, DIAGNOSIS, PRESCRIPTION, LAB_INVESTIGATION, CLINICAL_RECORD

**Relationships:**

| Relationship | Cardinality | Notes |
|---|---|---|
| PATIENT — APPOINTMENT | 1:N | One patient, many appointments |
| HEALTHCARE_PROFESSIONAL — APPOINTMENT | 1:N | One HP, many appointments |
| APPOINTMENT — DIAGNOSIS | 1:N | One appointment, one or more diagnoses |
| DIAGNOSIS — PRESCRIPTION | 1:N | One diagnosis, zero or more prescriptions |
| HEALTHCARE_PROFESSIONAL — PRESCRIPTION | 1:N | Prescribing doctor reference |
| PATIENT — LAB_INVESTIGATION | 1:N | One patient, many lab tests |
| HEALTHCARE_PROFESSIONAL — LAB_INVESTIGATION | 1:N | Ordering doctor reference |
| PATIENT — CLINICAL_RECORD | 1:N | One patient, many visit records |
| HEALTHCARE_PROFESSIONAL — CLINICAL_RECORD | 1:N | Attending HP reference |
| DEPARTMENT — HEALTHCARE_PROFESSIONAL | 1:N | One dept, many HPs |
| HEALTHCARE_PROFESSIONAL — DEPARTMENT (head) | 1:1 (optional) | Self-referential via head_hp_id |
| USER_ACCOUNT — PATIENT | 1:1 (optional) | Set when role = 'patient' |
| USER_ACCOUNT — HEALTHCARE_PROFESSIONAL | 1:1 (optional) | Set when role = 'admin' |

**Specialization (EER):** HEALTHCARE_PROFESSIONAL is a supertype; DOCTOR, NURSE, LAB_TECHNICIAN are subtypes (distinguished by the `role` attribute — partial, overlapping subtypes deferred to Term 2 if needed).

### 4.3 Relational Schema (DDL)

```sql
-- ============================================================
-- Smart Patient & Clinical Record Management System
-- PostgreSQL DDL — Term 1
-- ============================================================

CREATE TABLE department (
    dept_id      SERIAL PRIMARY KEY,
    dept_name    VARCHAR(100) NOT NULL UNIQUE,
    location     VARCHAR(100),
    head_hp_id   INT           -- FK added after healthcare_professional is created
);

CREATE TABLE healthcare_professional (
    hp_id          SERIAL PRIMARY KEY,
    first_name     VARCHAR(50)  NOT NULL,
    last_name      VARCHAR(50)  NOT NULL,
    specialization VARCHAR(100),
    role           VARCHAR(30)  NOT NULL CHECK (role IN ('doctor','nurse','technician','admin')),
    dept_id        INT          NOT NULL REFERENCES department(dept_id),
    contact        VARCHAR(20)
);

ALTER TABLE department
    ADD CONSTRAINT fk_dept_head
    FOREIGN KEY (head_hp_id) REFERENCES healthcare_professional(hp_id);

CREATE TABLE patient (
    patient_id    SERIAL PRIMARY KEY,
    first_name    VARCHAR(50)  NOT NULL,
    last_name     VARCHAR(50)  NOT NULL,
    dob           DATE         NOT NULL,
    gender        CHAR(1)      CHECK (gender IN ('M','F','O')),
    blood_group   VARCHAR(5),
    contact       VARCHAR(20),
    address       TEXT,
    registered_at TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE appointment (
    appt_id      SERIAL PRIMARY KEY,
    patient_id   INT          NOT NULL REFERENCES patient(patient_id),
    hp_id        INT          NOT NULL REFERENCES healthcare_professional(hp_id),
    scheduled_dt TIMESTAMP    NOT NULL,
    actual_dt    TIMESTAMP,
    status       VARCHAR(15)  NOT NULL DEFAULT 'scheduled'
                              CHECK (status IN ('scheduled','completed','cancelled')),
    notes        TEXT
);

CREATE TABLE diagnosis (
    diag_id     SERIAL PRIMARY KEY,
    appt_id     INT          NOT NULL REFERENCES appointment(appt_id),
    icd_code    VARCHAR(10)  NOT NULL,
    description TEXT,
    severity    VARCHAR(20)  CHECK (severity IN ('mild','moderate','severe','critical'))
);

CREATE TABLE prescription (
    rx_id           SERIAL PRIMARY KEY,
    diag_id         INT         NOT NULL REFERENCES diagnosis(diag_id),
    hp_id           INT         NOT NULL REFERENCES healthcare_professional(hp_id),
    medication_name VARCHAR(100) NOT NULL,
    dosage          VARCHAR(50),
    frequency       VARCHAR(50),
    duration_days   INT         CHECK (duration_days > 0),
    notes           TEXT
);

CREATE TABLE lab_investigation (
    lab_id          SERIAL PRIMARY KEY,
    patient_id      INT         NOT NULL REFERENCES patient(patient_id),
    ordered_by      INT         NOT NULL REFERENCES healthcare_professional(hp_id),
    test_name       VARCHAR(100) NOT NULL,
    test_date       DATE         NOT NULL DEFAULT CURRENT_DATE,
    result_value    VARCHAR(100),
    result_unit     VARCHAR(30),
    reference_range VARCHAR(50),
    status          VARCHAR(15)  NOT NULL DEFAULT 'pending'
                                 CHECK (status IN ('pending','completed','cancelled'))
);

CREATE TABLE clinical_record (
    record_id       SERIAL PRIMARY KEY,
    patient_id      INT         NOT NULL REFERENCES patient(patient_id),
    hp_id           INT         NOT NULL REFERENCES healthcare_professional(hp_id),
    visit_date      DATE         NOT NULL DEFAULT CURRENT_DATE,
    chief_complaint TEXT,
    clinical_notes  TEXT,
    record_type     VARCHAR(30)  NOT NULL
                                 CHECK (record_type IN ('inpatient','outpatient','emergency','follow-up'))
);

CREATE TABLE user_account (
    user_id       SERIAL PRIMARY KEY,
    username      VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role          VARCHAR(10)  NOT NULL CHECK (role IN ('admin','patient')),
    patient_id    INT          REFERENCES patient(patient_id),
    hp_id         INT          REFERENCES healthcare_professional(hp_id),
    created_at    TIMESTAMP    NOT NULL DEFAULT NOW(),
    is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
    -- Exactly one of patient_id or hp_id must be set
    CONSTRAINT chk_user_link CHECK (
        (patient_id IS NOT NULL AND hp_id IS NULL)
        OR (patient_id IS NULL AND hp_id IS NOT NULL)
    )
);
```

### 4.4 Normalization Process

| Normal Form | Description | Status in This Schema |
|---|---|---|
| 1NF | Atomic values; no repeating groups | Achieved — all columns hold single, indivisible values |
| 2NF | No partial dependencies on composite PK | Achieved — all PKs are single-column SERIALs |
| 3NF | No transitive dependencies | Achieved — no non-key attribute depends on another non-key |
| BCNF | Every determinant is a candidate key | Achieved — no non-trivial functional dependency violations |

**Key design decisions:**
- Prescription is separated from Diagnosis (not merged) to avoid a partial dependency on `diag_id` vs `hp_id`
- `lab_investigation` is not linked directly to `appointment` to allow walk-in lab tests; the FK to `ordered_by` (hp_id) preserves the ordering doctor
- `clinical_record` is a standalone summary record, not a view, to allow direct INSERT from a clinical workflow independent of the appointment system
- `user_account` holds only authentication and role data; patient demographics and professional details remain in their own tables. This avoids transitive dependencies (username → role → clinical data) and keeps the auth table replaceable without schema changes to clinical tables
- The `chk_user_link` CHECK constraint enforces that every user account is tied to exactly one entity (either a patient or a healthcare professional), preventing orphaned accounts

### 4.5 Indexes

```sql
-- FK indexes for join performance
CREATE INDEX idx_appt_patient    ON appointment(patient_id);
CREATE INDEX idx_appt_hp         ON appointment(hp_id);
CREATE INDEX idx_diag_appt       ON diagnosis(appt_id);
CREATE INDEX idx_rx_diag         ON prescription(diag_id);
CREATE INDEX idx_rx_hp           ON prescription(hp_id);
CREATE INDEX idx_lab_patient     ON lab_investigation(patient_id);
CREATE INDEX idx_lab_ordered_by  ON lab_investigation(ordered_by);
CREATE INDEX idx_cr_patient      ON clinical_record(patient_id);
CREATE INDEX idx_hp_dept         ON healthcare_professional(dept_id);

-- Query support indexes
CREATE INDEX idx_appt_status     ON appointment(status);
CREATE INDEX idx_appt_scheduled  ON appointment(scheduled_dt);
CREATE INDEX idx_lab_status      ON lab_investigation(status);

-- User account indexes
CREATE INDEX idx_user_username   ON user_account(username);
CREATE INDEX idx_user_patient    ON user_account(patient_id);
CREATE INDEX idx_user_hp         ON user_account(hp_id);
CREATE INDEX idx_user_role       ON user_account(role);
```

### 4.6 Views

```sql
-- Full clinical summary per patient visit
CREATE VIEW patient_clinical_summary AS
SELECT
    p.patient_id, p.first_name || ' ' || p.last_name AS patient_name,
    a.appt_id, a.scheduled_dt, a.status AS appt_status,
    h.first_name || ' ' || h.last_name AS doctor_name, h.specialization,
    d.dept_name,
    diag.icd_code, diag.description AS diagnosis, diag.severity,
    rx.medication_name, rx.dosage, rx.duration_days
FROM patient p
JOIN appointment       a    ON a.patient_id = p.patient_id
JOIN healthcare_professional h ON h.hp_id = a.hp_id
JOIN department        d    ON d.dept_id = h.dept_id
LEFT JOIN diagnosis    diag ON diag.appt_id = a.appt_id
LEFT JOIN prescription rx   ON rx.diag_id = diag.diag_id;

-- Patient lab history
CREATE VIEW patient_lab_history AS
SELECT
    p.patient_id, p.first_name || ' ' || p.last_name AS patient_name,
    li.test_name, li.test_date, li.result_value, li.result_unit,
    li.reference_range, li.status,
    h.first_name || ' ' || h.last_name AS ordered_by_name
FROM patient p
JOIN lab_investigation li ON li.patient_id = p.patient_id
JOIN healthcare_professional h ON h.hp_id = li.ordered_by;
```

### 4.7 Data Dictionary

#### Table: `patient`
| Column | Type | Constraints | Description |
|---|---|---|---|
| patient_id | SERIAL | PK | Auto-increment patient identifier |
| first_name | VARCHAR(50) | NOT NULL | Patient first name |
| last_name | VARCHAR(50) | NOT NULL | Patient last name |
| dob | DATE | NOT NULL | Date of birth |
| gender | CHAR(1) | CHECK (M/F/O) | Gender |
| blood_group | VARCHAR(5) | | ABO/Rh blood group |
| contact | VARCHAR(20) | | Phone number |
| address | TEXT | | Residential address |
| registered_at | TIMESTAMP | DEFAULT NOW() | Registration timestamp |

#### Table: `department`
| Column | Type | Constraints | Description |
|---|---|---|---|
| dept_id | SERIAL | PK | Department identifier |
| dept_name | VARCHAR(100) | NOT NULL, UNIQUE | Department name |
| location | VARCHAR(100) | | Physical location |
| head_hp_id | INT | FK→hp_id (nullable) | Department head |

#### Table: `healthcare_professional`
| Column | Type | Constraints | Description |
|---|---|---|---|
| hp_id | SERIAL | PK | Healthcare professional ID |
| first_name | VARCHAR(50) | NOT NULL | First name |
| last_name | VARCHAR(50) | NOT NULL | Last name |
| specialization | VARCHAR(100) | | Medical specialization |
| role | VARCHAR(30) | NOT NULL, CHECK | doctor / nurse / technician / admin |
| dept_id | INT | FK→dept_id | Department assignment |
| contact | VARCHAR(20) | | Contact number |

#### Table: `appointment`
| Column | Type | Constraints | Description |
|---|---|---|---|
| appt_id | SERIAL | PK | Appointment identifier |
| patient_id | INT | FK→patient | Patient being seen |
| hp_id | INT | FK→hp | Attending professional |
| scheduled_dt | TIMESTAMP | NOT NULL | Scheduled date and time |
| actual_dt | TIMESTAMP | | Actual date and time seen |
| status | VARCHAR(15) | CHECK | scheduled / completed / cancelled |
| notes | TEXT | | General appointment notes |

#### Table: `diagnosis`
| Column | Type | Constraints | Description |
|---|---|---|---|
| diag_id | SERIAL | PK | Diagnosis identifier |
| appt_id | INT | FK→appointment | Linked appointment |
| icd_code | VARCHAR(10) | NOT NULL | ICD-10 code |
| description | TEXT | | Diagnosis description |
| severity | VARCHAR(20) | CHECK | mild / moderate / severe / critical |

#### Table: `prescription`
| Column | Type | Constraints | Description |
|---|---|---|---|
| rx_id | SERIAL | PK | Prescription identifier |
| diag_id | INT | FK→diagnosis | Linked diagnosis |
| hp_id | INT | FK→hp | Prescribing professional |
| medication_name | VARCHAR(100) | NOT NULL | Drug name |
| dosage | VARCHAR(50) | | e.g., "500mg" |
| frequency | VARCHAR(50) | | e.g., "twice daily" |
| duration_days | INT | CHECK > 0 | Number of days |
| notes | TEXT | | Additional instructions |

#### Table: `lab_investigation`
| Column | Type | Constraints | Description |
|---|---|---|---|
| lab_id | SERIAL | PK | Lab test identifier |
| patient_id | INT | FK→patient | Patient tested |
| ordered_by | INT | FK→hp | Ordering professional |
| test_name | VARCHAR(100) | NOT NULL | Test name |
| test_date | DATE | DEFAULT CURRENT_DATE | Date ordered |
| result_value | VARCHAR(100) | | Result (text to support varied types) |
| result_unit | VARCHAR(30) | | Unit of measurement |
| reference_range | VARCHAR(50) | | Normal range |
| status | VARCHAR(15) | CHECK | pending / completed / cancelled |

#### Table: `clinical_record`
| Column | Type | Constraints | Description |
|---|---|---|---|
| record_id | SERIAL | PK | Record identifier |
| patient_id | INT | FK→patient | Patient |
| hp_id | INT | FK→hp | Attending professional |
| visit_date | DATE | DEFAULT CURRENT_DATE | Date of visit |
| chief_complaint | TEXT | | Primary complaint |
| clinical_notes | TEXT | | Full clinical notes |
| record_type | VARCHAR(30) | CHECK | inpatient / outpatient / emergency / follow-up |

#### Table: `user_account`
| Column | Type | Constraints | Description |
|---|---|---|---|
| user_id | SERIAL | PK | User account identifier |
| username | VARCHAR(100) | NOT NULL, UNIQUE | Login username (typically email) |
| password_hash | VARCHAR(255) | NOT NULL | bcrypt hash of the password — never stored in plain text |
| role | VARCHAR(10) | NOT NULL, CHECK | `admin` (full access) or `patient` (own records only) |
| patient_id | INT | FK→patient, nullable | Set when role = 'patient'; NULL for admin accounts |
| hp_id | INT | FK→healthcare_professional, nullable | Set when role = 'admin' linked to a professional; NULL for patient accounts |
| created_at | TIMESTAMP | DEFAULT NOW() | Account creation time |
| is_active | BOOLEAN | DEFAULT TRUE | Soft-disable account without deletion |

---

## 5. Frontend Requirements

### 5.1 Screen List

| # | Screen | Purpose |
|---|---|---|
| S1 | Dashboard | Summary: total patients, today's appointments, pending lab results |
| S2 | Patient Register / Search | Register new patient; search by name or ID |
| S3 | Appointment Management | Book, view, update appointments; filter by date / doctor |
| S4 | Clinical Record View | View full clinical history for a patient (diagnoses, prescriptions) |
| S5 | Lab Investigation | Add lab result; view test history for a patient |

**Technology:** React (TypeScript) SPA, component library (e.g., shadcn/ui or custom), Vite build tool. Clean, modern clinical UI with dark/light mode support.

### 5.2 Screen Specifications

**S0 – Login Screen** *(new)*
- Form: username, password
- Submit: `POST /auth/login` → receive JWT
- On success: redirect to Patient Portal (role=patient) or Admin Console (role=admin)
- Token stored in memory / httpOnly cookie; role decoded from JWT payload

**S1 – Dashboard** *(admin only)*
- Display: total registered patients, appointments today, pending lab investigations
- Data source: `GET /stats`
- Layout: 4 summary cards + recent appointments table

**S2 – Patient Register / Search** *(admin only)*
- Form: first_name, last_name, dob, gender, blood_group, contact, address
- Submit: `POST /patients`
- Search bar: `GET /patients?search=<name|id>`
- Results table with link to clinical history

**S3 – Appointment Management** *(admin only)*
- Form: patient_id (dropdown/search), hp_id (dropdown), scheduled_dt
- Submit: `POST /appointments`
- Table: list appointments with status badge; Update button → `PUT /appointments/{id}`
- Filter: by date range, doctor, status

**S4 – Clinical Record View**
- Admin: select any patient_id → `GET /clinical-records/{patient_id}`
- Patient: automatically scoped to own patient_id from JWT
- Display nested timeline: appointments → diagnoses → prescriptions

**S5 – Lab Investigation**
- Admin: `POST /lab-investigations`, `PUT /lab-investigations/{id}`, view all
- Patient: read-only view of own labs via `GET /lab-investigations/{patient_id}`

**S6 – Patient Portal** *(patient role)*
- Tabs: Timeline, Labs, Records — all scoped to the logged-in patient's data
- AI chat assistant sidebar
- No create/edit/delete controls visible

---

## 6. Backend Specifications

### 6.1 REST API Endpoints

**Authentication endpoints (public — no token required):**

| Method | Endpoint | Description |
|---|---|---|
| POST | /auth/login | Validate username + password, return JWT with role and user_id claims |
| POST | /auth/logout | Invalidate token (client-side token deletion) |

**Protected endpoints (Bearer token required on all):**

| Method | Endpoint | Description | Admin | Patient |
|---|---|---|---|---|
| GET | /patients | List all patients (optional `?search=`) | ✅ | ❌ |
| GET | /patients/{id} | Get patient by ID | ✅ | ✅ own only |
| POST | /patients | Register new patient | ✅ | ❌ |
| GET | /appointments | List appointments (filters: date, hp_id, status) | ✅ | ❌ |
| GET | /appointments?patient_id={id} | List appointments for a specific patient | ✅ | ✅ own only |
| POST | /appointments | Book appointment | ✅ | ❌ |
| PUT | /appointments/{id} | Update status/notes | ✅ | ❌ |
| DELETE | /appointments/{id} | Cancel appointment (set status=cancelled) | ✅ | ❌ |
| GET | /clinical-records/{patient_id} | Full clinical history for a patient | ✅ | ✅ own only |
| POST | /diagnoses | Add diagnosis | ✅ | ❌ |
| POST | /prescriptions | Add prescription | ✅ | ❌ |
| GET | /lab-investigations/{patient_id} | Lab results for a patient | ✅ | ✅ own only |
| GET | /lab-investigations | All lab investigations | ✅ | ❌ |
| POST | /lab-investigations | Submit lab investigation | ✅ | ❌ |
| PUT | /lab-investigations/{id} | Update lab result | ✅ | ❌ |
| GET | /stats | Dashboard summary counts | ✅ | ❌ |
| GET | /departments | List departments | ✅ | ❌ |
| GET | /healthcare-professionals | List HPs (filter by dept/role) | ✅ | ❌ |

**Access control rule:** Every protected endpoint must extract the `role` and `patient_id` from the JWT. If `role == 'patient'` and the endpoint returns patient-scoped data, the server must verify that the requested `patient_id` matches the token's `patient_id`; otherwise return 403 Forbidden.

**All responses:** JSON. **All inputs:** validated server-side. **All SQL:** parameterized (no string concatenation).

### 6.2 Database Connectivity

- **Framework:** FastAPI (Python) — replaces Flask; provides async support, automatic OpenAPI docs at `/docs`, and built-in Pydantic validation
- **Driver:** psycopg2 (Python PostgreSQL driver) or asyncpg for async routes
- **Connection pool:** `psycopg2.pool.ThreadedConnectionPool` (or asyncpg pool for async); pool size configurable via environment variable
- **Authentication:** JSON Web Tokens (JWT) via `python-jose`; passwords hashed with `bcrypt` via `passlib`
- **Pattern:** route handler → JWT decode + role check → validate input (Pydantic model) → execute parameterized query → return JSON
- **Error handling:** DB exceptions caught, logged, returned as `{"error": "message"}` with appropriate HTTP status code; auth failures return 401 Unauthorized; role violations return 403 Forbidden

---

## 7. System Features

### 7.1 Data Integrity

- PK/FK constraints enforced at DB level — no orphan records possible
- `ON DELETE RESTRICT` on patient → appointment, appointment → diagnosis, diagnosis → prescription (cascade deletes are intentionally avoided in clinical systems)
- CHECK constraints on status fields, gender, role, severity
- NOT NULL on all clinically required fields

### 7.2 Analytical Queries (Examples)

```sql
-- Q1: Number of appointments per doctor this month
SELECT hp.first_name, hp.last_name, COUNT(*) AS appt_count
FROM appointment a JOIN healthcare_professional hp ON hp.hp_id = a.hp_id
WHERE a.scheduled_dt >= date_trunc('month', NOW())
GROUP BY hp.hp_id, hp.first_name, hp.last_name
ORDER BY appt_count DESC;

-- Q2: Most common diagnoses (top 10 ICD codes)
SELECT icd_code, description, COUNT(*) AS count
FROM diagnosis
GROUP BY icd_code, description
ORDER BY count DESC LIMIT 10;

-- Q3: Average lab result turnaround (ordered → completed)
-- (requires adding completed_at column in Term 2 enhancement)

-- Q4: Patients with pending lab investigations
SELECT DISTINCT p.patient_id, p.first_name, p.last_name, COUNT(li.lab_id) AS pending_tests
FROM patient p JOIN lab_investigation li ON li.patient_id = p.patient_id
WHERE li.status = 'pending'
GROUP BY p.patient_id, p.first_name, p.last_name;

-- Q5: Full patient clinical summary (using view)
SELECT * FROM patient_clinical_summary WHERE patient_id = $1;
```

---

## 8. External Interface Requirements

| Interface Type | Description |
|---|---|
| User Interface | React (TypeScript) SPA, browser-based, desktop viewport, modern component library |
| Backend | Python FastAPI REST API, port 8000, with auto-generated OpenAPI docs at `/docs` |
| Database | PostgreSQL, port 5432, accessed via psycopg2 / asyncpg |
| Authentication | JWT Bearer tokens; `python-jose` for signing, `passlib[bcrypt]` for password hashing |
| Containerization | Docker Compose: `web` (FastAPI) + `db` (PostgreSQL) services |
| CI/CD | GitHub Actions: triggered on push to `main` |
| Developer Tools | Any SQL client (DBeaver, psql, pgAdmin) for DB inspection; FastAPI `/docs` for API testing |

---

## 9. Performance Requirements

| ID | Requirement |
|---|---|
| P1 | Single-table SELECT on ≤ 1,000 rows: < 2 seconds |
| P2 | 5-table JOIN on ≤ 1,000 rows: < 3 seconds |
| P3 | INSERT operations (patient, appointment, lab): < 1 second |
| P4 | Dashboard summary query (aggregate counts): < 2 seconds |
| P5 | All FK columns indexed to support join performance (see §4.5) |

---

## 10. Validation and Verification

| Test ID | Description | Expected Result |
|---|---|---|
| T1 | Register patient with valid data | Patient record created, 201 returned |
| T2 | Register patient with missing required field | 400 Bad Request returned |
| T3 | Book appointment with invalid patient_id | FK violation, 400 returned |
| T4 | Book appointment with invalid hp_id | FK violation, 400 returned |
| T5 | Add diagnosis to valid appointment | Diagnosis created, linked correctly |
| T6 | Add prescription with invalid diag_id | FK violation rejected |
| T7 | Submit lab investigation | Record created with status=pending |
| T8 | Update lab investigation result | status updated to completed |
| T9 | Attempt DELETE on patient with appointments | ON DELETE RESTRICT — rejected |
| T10 | Query patient clinical summary view | Returns joined data across 5 tables |
| T11 | Search patient by name (partial match) | Returns matching patients |
| T12 | Filter appointments by date range | Returns correct subset |
| T13 | Dashboard stats query | Returns correct counts |
| T14 | 5-table join executes under 3 seconds | Performance within NFR2 |
| T15 | Parameterized SQL — inject attempt | Input sanitized, no injection possible |
| T16 | Login with valid admin credentials | Returns JWT with role=admin, 200 OK |
| T17 | Login with valid patient credentials | Returns JWT with role=patient, 200 OK |
| T18 | Login with wrong password | 401 Unauthorized returned |
| T19 | Patient requests own records (`GET /patients/1` with patient_id=1 in token) | 200 OK, data returned |
| T20 | Patient requests another patient's records (`GET /patients/2` with patient_id=1 in token) | 403 Forbidden returned |
| T21 | Patient attempts `POST /patients` | 403 Forbidden returned |
| T22 | Admin accesses any patient's records | 200 OK returned |
| T23 | Request with expired JWT | 401 Unauthorized returned |
| T24 | Request with no Authorization header on protected route | 401 Unauthorized returned |

---

## 11. Appendix

### 11.1 Assumptions and System Constraints

- Each appointment is with exactly one doctor (no multi-doctor appointment in Term 1)
- Lab investigations are text-based results only (no file attachments in Term 1)
- No authentication system is implemented beyond a simple login screen (optional per handout)
- Dates and times stored in UTC
- The system does not implement billing or insurance management (out of scope)
- Single-hospital deployment assumed (no multi-tenant schema in Term 1)

### 11.2 Future Enhancements (Term 2)

- Medical image storage (BLOB/object storage for X-ray, MRI, CT scans)
- ECG and audio record attachments (file references + metadata)
- PDF lab report storage
- Temporal tables for diagnosis history tracking
- Role-based access control (RBAC) with JWT authentication
- Multi-hospital / multi-tenant schema
- HL7 FHIR API compliance layer

### 11.3 Document History

| Version | Date | Description |
|---|---|---|
| 1.0 (Draft) | 26 Sept 2026 | Initial SRS for Lab Session 1 submission |
| 1.1 | 17 Oct 2026 | Final SRS with prototype feedback incorporated |
| 1.2 | 18 Oct 2026 | Added role-based access control (admin/patient), `user_account` table, JWT auth, updated tech stack to FastAPI + React (TypeScript), added FR19–FR22 and T16–T24 |

---

**Compliance:** This SRS is structured in accordance with IEEE 830-1998 and ISO/IEC/IEEE 29148:2018.
