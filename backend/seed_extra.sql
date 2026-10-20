-- ClinIQ — Extended Seed Data
-- Adds richer history for all 5 patients: more appointments, diagnoses,
-- prescriptions, lab results, and clinical records.
-- Safe to run on top of schema.sql (does NOT re-insert existing rows).

-- ─────────────────────────────────────────────
-- APPOINTMENTS (ids 8-22)
-- ─────────────────────────────────────────────
INSERT INTO appointment (appt_id, patient_id, hp_id, scheduled_dt, actual_dt, status, notes) VALUES
    -- Rahul Verma (patient 1) — Cardiology + General Medicine
    ( 8, 1, 1, '2026-09-01 09:00', '2026-09-01 09:20', 'completed', 'Annual cardiac checkup'),
    ( 9, 1, 2, '2026-08-15 11:00', '2026-08-15 11:25', 'completed', 'Dizziness episodes'),
    (10, 1, 4, '2026-07-10 14:00', '2026-07-10 14:30', 'completed', 'Diabetes screening'),
    (11, 1, 1, '2026-11-15 10:00', NULL,               'scheduled', '3-month BP review'),

    -- Priti Nair (patient 2) — Neurology + General
    (12, 2, 2, '2026-09-10 10:00', '2026-09-10 10:30', 'completed', 'MRI review'),
    (13, 2, 4, '2026-08-05 09:00', '2026-08-05 09:15', 'completed', 'Annual physical'),
    (14, 2, 2, '2026-11-20 11:00', NULL,               'scheduled', 'Migraine management review'),

    -- Amit Gupta (patient 3) — Orthopedics + General
    (15, 3, 3, '2026-09-20 09:30', '2026-09-20 09:50', 'completed', 'Post-surgery knee follow-up'),
    (16, 3, 4, '2026-08-20 14:00', '2026-08-20 14:20', 'completed', 'General checkup'),
    (17, 3, 3, '2026-11-10 09:30', NULL,               'scheduled', 'Physiotherapy assessment'),

    -- Sneha Pillai (patient 4) — General + Cardiology
    (18, 4, 4, '2026-09-05 10:00', '2026-09-05 10:20', 'completed', 'Thyroid follow-up'),
    (19, 4, 1, '2026-08-12 11:00', '2026-08-12 11:15', 'completed', 'Palpitations checkup'),
    (20, 4, 4, '2026-11-05 10:00', NULL,               'scheduled', 'Routine follow-up'),

    -- Karan Bhatia (patient 5) — Cardiology + General
    (21, 5, 1, '2026-09-15 16:00', '2026-09-15 16:20', 'completed', 'Echo result review'),
    (22, 5, 4, '2026-08-25 09:00', '2026-08-25 09:30', 'completed', 'Sports physical exam')
ON CONFLICT (appt_id) DO NOTHING;

-- ─────────────────────────────────────────────
-- DIAGNOSES (ids 5-16)
-- ─────────────────────────────────────────────
INSERT INTO diagnosis (diag_id, appt_id, icd_code, description, severity) VALUES
    -- Rahul (appts 8,9,10)
    ( 5,  8, 'I10',   'Hypertension — stable',                   'mild'),
    ( 6,  9, 'R42',   'Dizziness due to orthostatic hypotension', 'mild'),
    ( 7, 10, 'E11.9', 'Type 2 Diabetes Mellitus — early onset',  'moderate'),

    -- Priti (appts 12,13)
    ( 8, 12, 'G43.1', 'Migraine with aura',                      'moderate'),
    ( 9, 13, 'E03.9', 'Hypothyroidism',                          'mild'),

    -- Amit (appts 15,16)
    (10, 15, 'M17.11','Primary osteoarthritis — right knee',     'moderate'),
    (11, 16, 'E78.5', 'Hyperlipidemia',                          'mild'),

    -- Sneha (appts 18,19)
    (12, 18, 'E05.90','Hyperthyroidism',                         'moderate'),
    (13, 19, 'I49.9', 'Cardiac arrhythmia — benign',             'mild'),

    -- Karan (appts 21,22)
    (14, 21, 'I42.9', 'Dilated cardiomyopathy — borderline',     'moderate'),
    (15, 22, 'M54.5', 'Lower back pain',                         'mild'),
    (16, 22, 'J30.1', 'Allergic rhinitis',                       'mild')
ON CONFLICT (diag_id) DO NOTHING;

-- ─────────────────────────────────────────────
-- PRESCRIPTIONS (ids 6-19)
-- ─────────────────────────────────────────────
INSERT INTO prescription (rx_id, diag_id, hp_id, medication, dosage, frequency, duration_days) VALUES
    -- Rahul
    ( 6,  5, 1, 'Amlodipine',    '5mg',    'Once daily',    30),
    ( 7,  6, 2, 'Betahistine',   '8mg',    'Twice daily',   14),
    ( 8,  7, 4, 'Metformin',     '500mg',  'Twice daily',   90),
    ( 9,  7, 4, 'Glimepiride',   '1mg',    'Once daily',    90),

    -- Priti
    (10,  8, 2, 'Topiramate',    '25mg',   'Once daily',    60),
    (11,  8, 2, 'Rizatriptan',   '10mg',   'As needed',     10),
    (12,  9, 4, 'Levothyroxine', '50mcg',  'Once daily',   180),

    -- Amit
    (13, 10, 3, 'Diclofenac',   '50mg',   'Twice daily',   14),
    (14, 10, 3, 'Pantoprazole', '40mg',   'Once daily',    14),
    (15, 11, 4, 'Atorvastatin', '10mg',   'Once at night', 90),

    -- Sneha
    (16, 12, 4, 'Carbimazole',  '5mg',    'Thrice daily',  45),
    (17, 13, 1, 'Metoprolol',   '25mg',   'Once daily',    30),

    -- Karan
    (18, 14, 1, 'Carvedilol',   '3.125mg','Twice daily',   90),
    (19, 14, 1, 'Furosemide',   '20mg',   'Once daily',    30)
ON CONFLICT (rx_id) DO NOTHING;

-- ─────────────────────────────────────────────
-- LAB INVESTIGATIONS (ids 8-26)
-- ─────────────────────────────────────────────
INSERT INTO lab_investigation (lab_id, patient_id, ordered_by, test_name, result, ref_range, status, ordered_at) VALUES
    -- Rahul
    ( 8, 1, 1, 'Blood Pressure Ambulatory', '135/88 mmHg avg',       '< 130/80 mmHg', 'completed', '2026-09-01 09:30'),
    ( 9, 1, 4, 'Fasting Blood Glucose',      '118 mg/dL',             '70–100 mg/dL',  'completed', '2026-07-10 14:45'),
    (10, 1, 4, 'HbA1c (3-month)',            '6.4%',                  '< 5.7%',        'completed', '2026-09-01 09:40'),
    (11, 1, 1, 'Serum Creatinine',           '0.9 mg/dL',             '0.7–1.2 mg/dL', 'completed', '2026-09-01 09:45'),
    (12, 1, 1, 'Thyroid Profile (TSH)',      '2.1 mIU/L',             '0.4–4.0 mIU/L', 'completed', '2026-08-15 11:30'),

    -- Priti
    (13, 2, 2, 'EEG',                        'Normal waveform',        'N/A',           'completed', '2026-09-10 11:00'),
    (14, 2, 4, 'Thyroid Profile (TSH)',       '8.5 mIU/L',             '0.4–4.0 mIU/L', 'completed', '2026-08-05 09:30'),
    (15, 2, 4, 'Complete Blood Count',       'Hb: 11.8, WBC: 6200',   'Hb 12-16',      'completed', '2026-08-05 09:35'),
    (16, 2, 2, 'Vitamin B12',                '195 pg/mL',             '200–900 pg/mL', 'completed', '2026-09-10 11:10'),

    -- Amit
    (17, 3, 3, 'X-Ray Knee (follow-up)',     'Mild joint space narrowing', 'N/A',       'completed', '2026-09-20 10:00'),
    (18, 3, 4, 'Lipid Panel',                'Total: 218, LDL: 145',  'LDL < 100',     'completed', '2026-08-20 14:30'),
    (19, 3, 3, 'Uric Acid',                  '7.8 mg/dL',             '3.5–7.2 mg/dL', 'completed', '2026-09-20 10:05'),
    (20, 3, 3, 'MRI Knee',                   NULL,                    'N/A',            'pending',   '2026-11-10 10:00'),

    -- Sneha
    (21, 4, 4, 'T3/T4/TSH Panel',            'TSH: 0.1, T4: 18',      'TSH 0.4–4.0',   'completed', '2026-09-05 10:30'),
    (22, 4, 1, 'ECG (12-lead)',               'Mild tachycardia 102bpm','60–100 bpm',    'completed', '2026-08-12 11:30'),
    (23, 4, 4, 'Liver Function Test',         'All within range',       'Normal',        'completed', '2026-09-05 10:35'),

    -- Karan
    (24, 5, 1, 'Echocardiogram (follow-up)', 'EF: 48%, mild LV dilation','EF > 55%',    'completed', '2026-09-15 16:30'),
    (25, 5, 1, 'NT-proBNP',                  '320 pg/mL',             '< 125 pg/mL',   'completed', '2026-09-15 16:40'),
    (26, 5, 4, 'Allergy Panel',              NULL,                    'N/A',            'pending',   '2026-10-07 16:30')
ON CONFLICT (lab_id) DO NOTHING;

-- ─────────────────────────────────────────────
-- CLINICAL RECORDS (ids 5-16)
-- ─────────────────────────────────────────────
INSERT INTO clinical_record (record_id, patient_id, hp_id, visit_date, chief_complaint, notes, type) VALUES
    -- Rahul
    ( 5, 1, 1, '2026-09-01', 'Annual cardiac review',       'BP stable at 135/88. HbA1c borderline. Started Metformin.', 'follow-up'),
    ( 6, 1, 2, '2026-08-15', 'Dizziness on standing',       'Orthostatic hypotension suspected. Advised hydration and salt intake.', 'consultation'),
    ( 7, 1, 4, '2026-07-10', 'Routine diabetes screening',  'FBG 118, pre-diabetic range. Dietary counselling given. Metformin initiated.', 'consultation'),

    -- Priti
    ( 8, 2, 2, '2026-09-10', 'Migraine worsening',          'Switched to Topiramate prophylaxis. MRI unchanged from baseline.', 'follow-up'),
    ( 9, 2, 4, '2026-08-05', 'Fatigue and cold intolerance','TSH elevated at 8.5. Hypothyroidism diagnosed. Levothyroxine started.', 'consultation'),

    -- Amit
    (10, 3, 3, '2026-09-20', 'Knee pain post-surgery',      'X-ray shows mild narrowing. Physiotherapy recommended. Diclofenac continued.', 'follow-up'),
    (11, 3, 4, '2026-08-20', 'Routine checkup',             'Lipids elevated. Atorvastatin prescribed. Lifestyle modification advised.', 'consultation'),

    -- Sneha
    (12, 4, 4, '2026-09-05', 'Palpitations and weight loss','TSH suppressed. Hyperthyroidism confirmed. Carbimazole started.', 'consultation'),
    (13, 4, 1, '2026-08-12', 'Fast heartbeat',              'ECG showed mild tachycardia. Metoprolol added. Echo scheduled.', 'consultation'),

    -- Karan
    (14, 5, 1, '2026-09-15', 'Echo result discussion',      'EF 48%, borderline dilated cardiomyopathy. Started Carvedilol + Furosemide. Restrict sodium.', 'consultation'),
    (15, 5, 4, '2026-08-25', 'Pre-sports medical',          'Lower back strain and seasonal allergies noted. Cleared for light sport.', 'routine'),
    (16, 5, 1, '2026-10-07', 'Cardiology follow-up',        'Symptoms improving. Continue current medications. Repeat echo in 3 months.', 'follow-up')
ON CONFLICT (record_id) DO NOTHING;

-- ─────────────────────────────────────────────
-- Reset sequences
-- ─────────────────────────────────────────────
SELECT setval('appointment_appt_id_seq',       (SELECT MAX(appt_id)    FROM appointment));
SELECT setval('diagnosis_diag_id_seq',         (SELECT MAX(diag_id)    FROM diagnosis));
SELECT setval('prescription_rx_id_seq',        (SELECT MAX(rx_id)      FROM prescription));
SELECT setval('lab_investigation_lab_id_seq',  (SELECT MAX(lab_id)     FROM lab_investigation));
SELECT setval('clinical_record_record_id_seq', (SELECT MAX(record_id)  FROM clinical_record));
