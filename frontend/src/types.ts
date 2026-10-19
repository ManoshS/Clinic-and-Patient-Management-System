export interface TokenPayload {
  user_id: number
  role: string
  patient_id: number | null
  exp: number
}

export interface Patient {
  patient_id: number
  first_name: string
  last_name: string
  dob: string | null
  gender: string | null
  blood_group: string | null
  contact: string | null
  address: string | null
  registered_at: string | null
}

export interface Appointment {
  appt_id: number
  patient_id: number
  hp_id: number
  scheduled_dt: string
  actual_dt: string | null
  status: string
  notes: string | null
  patient_name: string
  doctor_name: string
}

export interface Diagnosis {
  diag_id: number
  appt_id: number
  icd_code: string | null
  description: string
  severity: string | null
}

export interface Prescription {
  rx_id: number
  diag_id: number
  hp_id: number
  medication: string
  dosage: string | null
  frequency: string | null
  duration_days: number | null
}

export interface Lab {
  lab_id: number
  patient_id: number
  ordered_by: number
  test_name: string
  result: string | null
  ref_range: string | null
  status: string
  ordered_at: string
  patient_name?: string
}

export interface ClinicalRecord {
  record_id: number
  patient_id: number
  hp_id: number
  visit_date: string
  chief_complaint: string | null
  notes: string | null
  type: string | null
  doctor_name: string
  specialization: string
}

export interface Department {
  dept_id: number
  dept_name: string
  head_hp_id: number | null
  staff_count: number
  head_name: string | null
}

export interface Professional {
  hp_id: number
  first_name: string
  last_name: string
  specialization: string | null
  role: string
  dept_id: number | null
  dept_name: string | null
}

export interface Stats {
  total_patients: number
  total_appointments: number
  scheduled_appointments: number
  pending_labs: number
}
