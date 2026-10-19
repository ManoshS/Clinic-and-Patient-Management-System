-- ClinIQ Schema v1.2
-- Drop in reverse FK order for clean reloads
DROP TABLE IF EXISTS user_account      CASCADE;
DROP TABLE IF EXISTS clinical_record   CASCADE;
DROP TABLE IF EXISTS lab_investigation CASCADE;
DROP TABLE IF EXISTS prescription      CASCADE;
DROP TABLE IF EXISTS diagnosis         CASCADE;
DROP TABLE IF EXISTS appointment       CASCADE;
DROP TABLE IF EXISTS patient           CASCADE;
DROP TABLE IF EXISTS healthcare_professional CASCADE;
DROP TABLE IF EXISTS department        CASCADE;

-- ─────────────────────────────────────────────
-- TABLES
-- ─────────────────────────────────────────────

CREATE TABLE department (
    dept_id     SERIAL PRIMARY KEY,
    dept_name   VARCHAR(100) NOT NULL UNIQUE,
    location    VARCHAR(150),
    head_hp_id  INT          -- FK added after healthcare_professional exists
);

CREATE TABLE healthcare_professional (
    hp_id           SERIAL PRIMARY KEY,
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    specialization  VARCHAR(100),
    role            VARCHAR(50)  NOT NULL,
    dept_id         INT          REFERENCES department(dept_id) ON DELETE SET NULL,
    contact         VARCHAR(20)
);

ALTER TABLE department
    ADD CONSTRAINT fk_dept_head
    FOREIGN KEY (head_hp_id) REFERENCES healthcare_professional(hp_id) ON DELETE SET NULL;

CREATE TABLE patient (
    patient_id    SERIAL PRIMARY KEY,
    first_name    VARCHAR(100) NOT NULL,
    last_name     VARCHAR(100) NOT NULL,
    dob           DATE,
    gender        VARCHAR(10)  CHECK (gender IN ('Male','Female','Other')),
    blood_group   VARCHAR(5),
    contact       VARCHAR(20),
    address       TEXT,
    registered_at TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE appointment (
    appt_id      SERIAL PRIMARY KEY,
    patient_id   INT          NOT NULL REFERENCES patient(patient_id)              ON DELETE RESTRICT,
    hp_id        INT          NOT NULL REFERENCES healthcare_professional(hp_id)   ON DELETE RESTRICT,
    scheduled_dt TIMESTAMP    NOT NULL,
    actual_dt    TIMESTAMP,
    status       VARCHAR(20)  NOT NULL DEFAULT 'scheduled'
                              CHECK (status IN ('scheduled','completed','cancelled','no-show')),
    notes        TEXT
);

CREATE TABLE diagnosis (
    diag_id     SERIAL PRIMARY KEY,
    appt_id     INT          NOT NULL REFERENCES appointment(appt_id) ON DELETE RESTRICT,
    icd_code    VARCHAR(20),
    description TEXT         NOT NULL,
    severity    VARCHAR(20)  CHECK (severity IN ('mild','moderate','severe'))
);

CREATE TABLE prescription (
    rx_id          SERIAL PRIMARY KEY,
    diag_id        INT          NOT NULL REFERENCES diagnosis(diag_id)              ON DELETE RESTRICT,
    hp_id          INT          NOT NULL REFERENCES healthcare_professional(hp_id)  ON DELETE RESTRICT,
    medication     VARCHAR(200) NOT NULL,
    dosage         VARCHAR(100),
    frequency      VARCHAR(100),
    duration_days  INT
);

CREATE TABLE lab_investigation (
    lab_id      SERIAL PRIMARY KEY,
    patient_id  INT          NOT NULL REFERENCES patient(patient_id)             ON DELETE RESTRICT,
    ordered_by  INT          NOT NULL REFERENCES healthcare_professional(hp_id)  ON DELETE RESTRICT,
    test_name   VARCHAR(200) NOT NULL,
    result      TEXT,
    ref_range   VARCHAR(100),
    status      VARCHAR(20)  NOT NULL DEFAULT 'pending'
                             CHECK (status IN ('pending','completed','cancelled')),
    ordered_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE clinical_record (
    record_id       SERIAL PRIMARY KEY,
    patient_id      INT          NOT NULL REFERENCES patient(patient_id)            ON DELETE RESTRICT,
    hp_id           INT          NOT NULL REFERENCES healthcare_professional(hp_id) ON DELETE RESTRICT,
    visit_date      DATE         NOT NULL,
    chief_complaint TEXT,
    notes           TEXT,
    type            VARCHAR(50)  CHECK (type IN ('consultation','follow-up','emergency','routine'))
);

CREATE TABLE user_account (
    user_id       SERIAL PRIMARY KEY,
    username      VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role          VARCHAR(10)  NOT NULL CHECK (role IN ('admin','patient')),
    patient_id    INT          REFERENCES patient(patient_id) ON DELETE SET NULL,
    hp_id         INT          REFERENCES healthcare_professional(hp_id) ON DELETE SET NULL,
    created_at    TIMESTAMP    NOT NULL DEFAULT NOW(),
    is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
    CONSTRAINT chk_user_link CHECK (
        (role = 'admin' AND patient_id IS NULL AND hp_id IS NULL)
        OR (role = 'patient' AND patient_id IS NOT NULL AND hp_id IS NULL)
    )
);

-- ─────────────────────────────────────────────
-- INDEXES (16 total)
-- ─────────────────────────────────────────────

-- appointment FK + filter columns
CREATE INDEX idx_appt_patient   ON appointment(patient_id);
CREATE INDEX idx_appt_hp        ON appointment(hp_id);
CREATE INDEX idx_appt_status    ON appointment(status);
CREATE INDEX idx_appt_scheduled ON appointment(scheduled_dt);

-- diagnosis FK
CREATE INDEX idx_diag_appt      ON diagnosis(appt_id);

-- prescription FK
CREATE INDEX idx_rx_diag        ON prescription(diag_id);
CREATE INDEX idx_rx_hp          ON prescription(hp_id);

-- lab_investigation FK + filter
CREATE INDEX idx_lab_patient    ON lab_investigation(patient_id);
CREATE INDEX idx_lab_ordered_by ON lab_investigation(ordered_by);
CREATE INDEX idx_lab_status     ON lab_investigation(status);
CREATE INDEX idx_lab_ordered_at ON lab_investigation(ordered_at);

-- clinical_record FK
CREATE INDEX idx_rec_patient    ON clinical_record(patient_id);
CREATE INDEX idx_rec_hp         ON clinical_record(hp_id);

-- user_account lookup
CREATE UNIQUE INDEX idx_user_username ON user_account(username);
CREATE INDEX idx_user_patient         ON user_account(patient_id);
CREATE INDEX idx_user_role            ON user_account(role);

-- ─────────────────────────────────────────────
-- VIEWS
-- ─────────────────────────────────────────────

CREATE OR REPLACE VIEW patient_clinical_summary AS
SELECT
    p.patient_id,
    p.first_name || ' ' || p.last_name        AS patient_name,
    a.appt_id,
    a.scheduled_dt,
    a.status                                   AS appt_status,
    hp.first_name || ' ' || hp.last_name       AS doctor_name,
    hp.specialization,
    d.icd_code,
    d.description                              AS diagnosis,
    d.severity,
    rx.medication,
    rx.dosage,
    rx.frequency
FROM patient p
JOIN appointment        a   ON a.patient_id = p.patient_id
JOIN healthcare_professional hp ON hp.hp_id = a.hp_id
LEFT JOIN diagnosis     d   ON d.appt_id    = a.appt_id
LEFT JOIN prescription  rx  ON rx.diag_id   = d.diag_id;

CREATE OR REPLACE VIEW patient_lab_history AS
SELECT
    l.lab_id,
    p.patient_id,
    p.first_name || ' ' || p.last_name         AS patient_name,
    l.test_name,
    l.result,
    l.ref_range,
    l.status,
    l.ordered_at,
    hp.first_name || ' ' || hp.last_name        AS ordered_by_name
FROM lab_investigation l
JOIN patient                 p  ON p.patient_id = l.patient_id
JOIN healthcare_professional hp ON hp.hp_id     = l.ordered_by;

-- ─────────────────────────────────────────────
-- SEED DATA
-- ─────────────────────────────────────────────

-- Departments
INSERT INTO department (dept_id, dept_name, location) VALUES
    (1, 'Cardiology',    'Block A, Floor 2'),
    (2, 'Neurology',     'Block B, Floor 3'),
    (3, 'Orthopedics',   'Block C, Floor 1'),
    (4, 'General Medicine', 'Block A, Floor 1'),
    (5, 'Pathology',     'Block D, Floor 0');

-- Healthcare Professionals
INSERT INTO healthcare_professional (hp_id, first_name, last_name, specialization, role, dept_id, contact) VALUES
    (1, 'Arjun',   'Mehta',    'Cardiology',      'Doctor',   1, '9810001001'),
    (2, 'Priya',   'Sharma',   'Neurology',        'Doctor',   2, '9810001002'),
    (3, 'Vikram',  'Singh',    'Orthopedics',      'Doctor',   3, '9810001003'),
    (4, 'Sunita',  'Rao',      'General Medicine', 'Doctor',   4, '9810001004'),
    (5, 'Deepak',  'Joshi',    'Pathology',        'Lab Tech', 5, '9810001005');

-- Set department heads
UPDATE department SET head_hp_id = 1 WHERE dept_id = 1;
UPDATE department SET head_hp_id = 2 WHERE dept_id = 2;
UPDATE department SET head_hp_id = 3 WHERE dept_id = 3;
UPDATE department SET head_hp_id = 4 WHERE dept_id = 4;
UPDATE department SET head_hp_id = 5 WHERE dept_id = 5;

-- Patients
INSERT INTO patient (patient_id, first_name, last_name, dob, gender, blood_group, contact, address) VALUES
    (1, 'Rahul',   'Verma',   '1990-03-15', 'Male',   'O+',  '9900001001', '12 MG Road, Bangalore'),
    (2, 'Priti',   'Nair',    '1985-07-22', 'Female', 'A+',  '9900001002', '45 Anna Salai, Chennai'),
    (3, 'Amit',    'Gupta',   '1978-11-30', 'Male',   'B-',  '9900001003', '7 Civil Lines, Delhi'),
    (4, 'Sneha',   'Pillai',  '1995-01-08', 'Female', 'AB+', '9900001004', '23 FC Road, Pune'),
    (5, 'Karan',   'Bhatia',  '2000-06-18', 'Male',   'O-',  '9900001005', '88 Park Street, Kolkata');

-- Appointments
INSERT INTO appointment (appt_id, patient_id, hp_id, scheduled_dt, actual_dt, status, notes) VALUES
    (1, 1, 1, '2026-10-01 10:00', '2026-10-01 10:15', 'completed',  'Routine cardiac check'),
    (2, 2, 2, '2026-10-02 11:00', '2026-10-02 11:10', 'completed',  'Headache follow-up'),
    (3, 3, 3, '2026-10-05 09:30', NULL,                'scheduled',  'Knee pain evaluation'),
    (4, 4, 4, '2026-10-06 14:00', '2026-10-06 14:20', 'completed',  'Fever and cough'),
    (5, 5, 1, '2026-10-07 16:00', NULL,                'scheduled',  'Palpitation complaint'),
    (6, 1, 4, '2026-10-08 10:00', '2026-10-08 10:30', 'completed',  'Follow-up on medication'),
    (7, 2, 2, '2026-10-10 12:00', NULL,                'cancelled',  'Patient cancelled');

-- Diagnoses (only for completed appointments)
INSERT INTO diagnosis (diag_id, appt_id, icd_code, description, severity) VALUES
    (1, 1, 'I10',   'Essential Hypertension',          'moderate'),
    (2, 2, 'G43.9', 'Migraine without aura',            'mild'),
    (3, 4, 'J06.9', 'Acute upper respiratory infection','mild'),
    (4, 6, 'I10',   'Hypertension follow-up',           'mild');

-- Prescriptions
INSERT INTO prescription (rx_id, diag_id, hp_id, medication, dosage, frequency, duration_days) VALUES
    (1, 1, 1, 'Amlodipine',    '5mg',   'Once daily',  30),
    (2, 1, 1, 'Atenolol',      '25mg',  'Once daily',  30),
    (3, 2, 2, 'Sumatriptan',   '50mg',  'As needed',   10),
    (4, 3, 4, 'Paracetamol',   '500mg', 'Thrice daily',  5),
    (5, 4, 1, 'Amlodipine',    '5mg',   'Once daily',  60);

-- Lab Investigations
INSERT INTO lab_investigation (lab_id, patient_id, ordered_by, test_name, result, ref_range, status, ordered_at) VALUES
    (1, 1, 1, 'Lipid Profile',   'LDL: 130 mg/dL', '< 100 mg/dL', 'completed', '2026-10-01 10:30'),
    (2, 1, 1, 'ECG',             'Normal sinus rhythm', 'N/A',      'completed', '2026-10-01 10:35'),
    (3, 2, 2, 'MRI Brain',       'No abnormality detected', 'N/A',  'completed', '2026-10-02 11:30'),
    (4, 3, 3, 'X-Ray Knee',      NULL,              'N/A',           'pending',   '2026-10-05 09:45'),
    (5, 4, 4, 'CBC',             'Hb: 13.2 g/dL',  '12–16 g/dL',  'completed', '2026-10-06 14:30'),
    (6, 5, 1, 'Echocardiogram',  NULL,              'N/A',           'pending',   '2026-10-07 16:15'),
    (7, 1, 4, 'HbA1c',          '5.8%',            '< 5.7%',       'completed', '2026-10-08 10:45');

-- Clinical Records
INSERT INTO clinical_record (record_id, patient_id, hp_id, visit_date, chief_complaint, notes, type) VALUES
    (1, 1, 1, '2026-10-01', 'Chest tightness and headache', 'BP 150/95. Started anti-hypertensives.',       'consultation'),
    (2, 2, 2, '2026-10-02', 'Recurring headaches',          'Migraine confirmed. Prescribed sumatriptan.',  'consultation'),
    (3, 4, 4, '2026-10-06', 'Fever and sore throat',        'URTI. Symptomatic treatment advised.',         'consultation'),
    (4, 1, 1, '2026-10-08', 'Medication review',            'BP now 130/85. Continue current medications.', 'follow-up');

-- ─────────────────────────────────────────────
-- USER ACCOUNTS
-- Passwords: admin → Admin@1234 | patients → Patient@1234
-- Hashes generated with passlib bcrypt rounds=12
-- ─────────────────────────────────────────────

INSERT INTO user_account (user_id, username, password_hash, role, patient_id, hp_id) VALUES
    (1, 'admin',
     '$2b$12$Lx.QnZK8zwPhust3Agd0NOrXpFhyoz9KslNM5a8LwRxWtgCBk8EdS',
     'admin', NULL, NULL),
    (2, 'rahul.verma',
     '$2b$12$z/Ho0OBNXIk6Zev7UW9Lo.9Dkauopn1CLHr.G5Zb6JTJ5uZdEr.he',
     'patient', 1, NULL),
    (3, 'priti.nair',
     '$2b$12$z/Ho0OBNXIk6Zev7UW9Lo.9Dkauopn1CLHr.G5Zb6JTJ5uZdEr.he',
     'patient', 2, NULL),
    (4, 'amit.gupta',
     '$2b$12$z/Ho0OBNXIk6Zev7UW9Lo.9Dkauopn1CLHr.G5Zb6JTJ5uZdEr.he',
     'patient', 3, NULL),
    (5, 'sneha.pillai',
     '$2b$12$z/Ho0OBNXIk6Zev7UW9Lo.9Dkauopn1CLHr.G5Zb6JTJ5uZdEr.he',
     'patient', 4, NULL),
    (6, 'karan.bhatia',
     '$2b$12$z/Ho0OBNXIk6Zev7UW9Lo.9Dkauopn1CLHr.G5Zb6JTJ5uZdEr.he',
     'patient', 5, NULL);

-- Reset sequences after explicit-ID inserts
SELECT setval('department_dept_id_seq',               (SELECT MAX(dept_id)    FROM department));
SELECT setval('healthcare_professional_hp_id_seq',    (SELECT MAX(hp_id)      FROM healthcare_professional));
SELECT setval('patient_patient_id_seq',               (SELECT MAX(patient_id) FROM patient));
SELECT setval('appointment_appt_id_seq',              (SELECT MAX(appt_id)    FROM appointment));
SELECT setval('diagnosis_diag_id_seq',                (SELECT MAX(diag_id)    FROM diagnosis));
SELECT setval('prescription_rx_id_seq',               (SELECT MAX(rx_id)      FROM prescription));
SELECT setval('lab_investigation_lab_id_seq',         (SELECT MAX(lab_id)     FROM lab_investigation));
SELECT setval('clinical_record_record_id_seq',        (SELECT MAX(record_id)  FROM clinical_record));
SELECT setval('user_account_user_id_seq',             (SELECT MAX(user_id)    FROM user_account));
