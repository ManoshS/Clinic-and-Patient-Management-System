from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
import psycopg2

from db import db_fetch, db_exec
from dependencies import get_current_user, require_admin
from models import PrescriptionCreate

router = APIRouter()


@router.get("/")
def list_prescriptions(diag_id: Optional[int] = None, user=Depends(get_current_user)):
    if user.get("role") == "patient":
        if not diag_id:
            raise HTTPException(status_code=403, detail="diag_id required for patient access")
        # verify the diagnosis belongs to one of this patient's appointments
        rows = db_fetch(
            """SELECT d.diag_id FROM diagnosis d
               JOIN appointment a ON a.appt_id = d.appt_id
               WHERE d.diag_id = %s AND a.patient_id = %s""",
            (diag_id, user.get("patient_id")),
        )
        if not rows:
            raise HTTPException(status_code=403, detail="Access denied")
    if diag_id:
        return db_fetch("SELECT * FROM prescription WHERE diag_id = %s ORDER BY rx_id", (diag_id,))
    return db_fetch("SELECT * FROM prescription ORDER BY rx_id")


@router.post("/", status_code=201)
def create_prescription(data: PrescriptionCreate, user=Depends(require_admin)):
    try:
        return db_exec(
            """INSERT INTO prescription (diag_id, hp_id, medication, dosage, frequency, duration_days)
               VALUES (%s, %s, %s, %s, %s, %s) RETURNING *""",
            (data.diag_id, data.hp_id, data.medication, data.dosage,
             data.frequency, data.duration_days),
        )
    except psycopg2.errors.ForeignKeyViolation as e:
        raise HTTPException(status_code=409, detail=f"Invalid reference: {e.pgerror}")
