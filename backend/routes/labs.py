from fastapi import APIRouter, Depends, HTTPException
import psycopg2

from db import db_fetch, db_exec
from dependencies import require_admin, require_patient_access, get_current_user
from models import LabCreate, LabUpdate

router = APIRouter()


@router.get("/")
def list_all_labs(user=Depends(require_admin)):
    return db_fetch(
        """SELECT l.*, p.first_name || ' ' || p.last_name AS patient_name
           FROM lab_investigation l
           JOIN patient p ON p.patient_id = l.patient_id
           ORDER BY l.ordered_at DESC"""
    )


@router.get("/{patient_id}")
def list_patient_labs(patient_id: int, user=Depends(get_current_user)):
    require_patient_access(patient_id, user)
    return db_fetch(
        "SELECT * FROM lab_investigation WHERE patient_id = %s ORDER BY ordered_at DESC",
        (patient_id,),
    )


@router.post("/", status_code=201)
def create_lab(data: LabCreate, user=Depends(require_admin)):
    try:
        return db_exec(
            """INSERT INTO lab_investigation (patient_id, ordered_by, test_name, ref_range)
               VALUES (%s, %s, %s, %s) RETURNING *""",
            (data.patient_id, data.ordered_by, data.test_name, data.ref_range),
        )
    except psycopg2.errors.ForeignKeyViolation as e:
        raise HTTPException(status_code=409, detail=f"Invalid reference: {e.pgerror}")


@router.put("/{lab_id}")
def update_lab(lab_id: int, data: LabUpdate, user=Depends(require_admin)):
    rows = db_fetch("SELECT * FROM lab_investigation WHERE lab_id = %s", (lab_id,))
    if not rows:
        raise HTTPException(status_code=404, detail="Lab investigation not found")
    lab = rows[0]
    return db_exec(
        """UPDATE lab_investigation SET result = %s, status = %s
           WHERE lab_id = %s RETURNING *""",
        (
            data.result if data.result is not None else lab["result"],
            data.status if data.status is not None else lab["status"],
            lab_id,
        ),
    )
