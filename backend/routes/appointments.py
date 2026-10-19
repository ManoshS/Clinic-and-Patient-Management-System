from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
import psycopg2

from db import db_fetch, db_exec, db_run
from dependencies import require_admin, get_current_user
from models import AppointmentCreate, AppointmentUpdate

router = APIRouter()


@router.get("/")
def list_appointments(
    patient_id: Optional[int] = None,
    status: Optional[str] = None,
    hp_id: Optional[int] = None,
    user=Depends(get_current_user),
):
    # Patients can only query their own appointments
    if user["role"] == "patient":
        if patient_id is None:
            patient_id = user["patient_id"]
        elif patient_id != user["patient_id"]:
            raise HTTPException(status_code=403, detail="Access denied")

    clauses, params = [], []
    if patient_id:
        clauses.append("a.patient_id = %s")
        params.append(patient_id)
    if status:
        clauses.append("a.status = %s")
        params.append(status)
    if hp_id:
        clauses.append("a.hp_id = %s")
        params.append(hp_id)

    where = ("WHERE " + " AND ".join(clauses)) if clauses else ""
    return db_fetch(
        f"""SELECT a.*,
               p.first_name || ' ' || p.last_name AS patient_name,
               hp.first_name || ' ' || hp.last_name AS doctor_name
            FROM appointment a
            JOIN patient p ON p.patient_id = a.patient_id
            JOIN healthcare_professional hp ON hp.hp_id = a.hp_id
            {where}
            ORDER BY a.scheduled_dt DESC""",
        tuple(params),
    )


@router.post("/", status_code=201)
def create_appointment(data: AppointmentCreate, user=Depends(require_admin)):
    try:
        return db_exec(
            """INSERT INTO appointment (patient_id, hp_id, scheduled_dt, notes)
               VALUES (%s, %s, %s, %s) RETURNING *""",
            (data.patient_id, data.hp_id, data.scheduled_dt, data.notes),
        )
    except psycopg2.errors.ForeignKeyViolation as e:
        raise HTTPException(status_code=409, detail=f"Invalid reference: {e.pgerror}")


@router.put("/{appt_id}")
def update_appointment(appt_id: int, data: AppointmentUpdate, user=Depends(require_admin)):
    rows = db_fetch("SELECT * FROM appointment WHERE appt_id = %s", (appt_id,))
    if not rows:
        raise HTTPException(status_code=404, detail="Appointment not found")
    a = rows[0]
    return db_exec(
        """UPDATE appointment SET
               scheduled_dt = %s, actual_dt = %s, status = %s, notes = %s
           WHERE appt_id = %s RETURNING *""",
        (
            data.scheduled_dt or a["scheduled_dt"],
            data.actual_dt    or a["actual_dt"],
            data.status       or a["status"],
            data.notes        if data.notes is not None else a["notes"],
            appt_id,
        ),
    )


@router.delete("/{appt_id}")
def cancel_appointment(appt_id: int, user=Depends(require_admin)):
    rows = db_fetch("SELECT appt_id FROM appointment WHERE appt_id = %s", (appt_id,))
    if not rows:
        raise HTTPException(status_code=404, detail="Appointment not found")
    db_run("UPDATE appointment SET status = 'cancelled' WHERE appt_id = %s", (appt_id,))
    return {"message": "Appointment cancelled"}
