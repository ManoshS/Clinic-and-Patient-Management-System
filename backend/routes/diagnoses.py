from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
import psycopg2

from db import db_fetch, db_exec
from dependencies import get_current_user, require_admin
from models import DiagnosisCreate

router = APIRouter()


@router.get("/")
def list_diagnoses(appt_id: Optional[int] = None, user=Depends(get_current_user)):
    if user.get("role") == "patient":
        if not appt_id:
            raise HTTPException(status_code=403, detail="appt_id required for patient access")
        # verify the appointment belongs to this patient
        rows = db_fetch(
            "SELECT appt_id FROM appointment WHERE appt_id = %s AND patient_id = %s",
            (appt_id, user.get("patient_id")),
        )
        if not rows:
            raise HTTPException(status_code=403, detail="Access denied")
    if appt_id:
        return db_fetch("SELECT * FROM diagnosis WHERE appt_id = %s ORDER BY diag_id", (appt_id,))
    return db_fetch("SELECT * FROM diagnosis ORDER BY diag_id")


@router.post("/", status_code=201)
def create_diagnosis(data: DiagnosisCreate, user=Depends(require_admin)):
    try:
        return db_exec(
            """INSERT INTO diagnosis (appt_id, icd_code, description, severity)
               VALUES (%s, %s, %s, %s) RETURNING *""",
            (data.appt_id, data.icd_code, data.description, data.severity),
        )
    except psycopg2.errors.ForeignKeyViolation as e:
        raise HTTPException(status_code=409, detail=f"Invalid reference: {e.pgerror}")
