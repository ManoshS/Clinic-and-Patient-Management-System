from typing import Optional
from pydantic import BaseModel


class RegisterRequest(BaseModel):
    username: str
    password: str
    role: str  # 'admin' or 'patient'
    # required when role='patient'
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    dob: Optional[str] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    contact: Optional[str] = None
    address: Optional[str] = None


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    role: str
    patient_id: Optional[int] = None


# ── Patient ───────────────────────────────────────────
class PatientCreate(BaseModel):
    first_name: str
    last_name: str
    dob: Optional[str] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    contact: Optional[str] = None
    address: Optional[str] = None


class PatientUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    dob: Optional[str] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    contact: Optional[str] = None
    address: Optional[str] = None


class PatientOut(BaseModel):
    patient_id: int
    first_name: str
    last_name: str
    dob: Optional[str] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    contact: Optional[str] = None
    address: Optional[str] = None
    registered_at: Optional[str] = None

    class Config:
        from_attributes = True


# ── Appointment ───────────────────────────────────────
class AppointmentCreate(BaseModel):
    patient_id: int
    hp_id: int
    scheduled_dt: str
    notes: Optional[str] = None


class AppointmentUpdate(BaseModel):
    scheduled_dt: Optional[str] = None
    actual_dt: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None


# ── Diagnosis ─────────────────────────────────────────
class DiagnosisCreate(BaseModel):
    appt_id: int
    icd_code: Optional[str] = None
    description: str
    severity: Optional[str] = None


# ── Prescription ──────────────────────────────────────
class PrescriptionCreate(BaseModel):
    diag_id: int
    hp_id: int
    medication: str
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    duration_days: Optional[int] = None


# ── Lab Investigation ─────────────────────────────────
class LabCreate(BaseModel):
    patient_id: int
    ordered_by: int
    test_name: str
    ref_range: Optional[str] = None


class LabUpdate(BaseModel):
    result: Optional[str] = None
    status: Optional[str] = None


# ── Stats ─────────────────────────────────────────────
class StatsOut(BaseModel):
    total_patients: int
    total_appointments: int
    scheduled_appointments: int
    pending_labs: int


# ── AI ────────────────────────────────────────────────
class ChatMessage(BaseModel):
    role: str  # 'user' or 'model'
    content: str


class ChatRequest(BaseModel):
    message: str
    history: list[ChatMessage] = []
