from fastapi import APIRouter, Depends, HTTPException
import psycopg2

from db import db_fetch, db_exec
from dependencies import require_admin, require_patient_access, get_current_user
from models import PatientCreate, PatientUpdate

router = APIRouter()


@router.get("/")
def list_patients(search: str = "", user=Depends(require_admin)):
    if search:
        like = f"%{search}%"
        return db_fetch(
            "SELECT * FROM patient WHERE first_name ILIKE %s OR last_name ILIKE %s OR contact ILIKE %s ORDER BY patient_id",
            (like, like, like),
        )
    return db_fetch("SELECT * FROM patient ORDER BY patient_id")


@router.get("/{patient_id}")
def get_patient(patient_id: int, user=Depends(get_current_user)):
    require_patient_access(patient_id, user)
    rows = db_fetch("SELECT * FROM patient WHERE patient_id = %s", (patient_id,))
    if not rows:
        raise HTTPException(status_code=404, detail="Patient not found")
    return rows[0]


@router.post("/", status_code=201)
def create_patient(data: PatientCreate, user=Depends(require_admin)):
    try:
        return db_exec(
            """INSERT INTO patient (first_name, last_name, dob, gender, blood_group, contact, address)
               VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING *""",
            (data.first_name, data.last_name, data.dob, data.gender,
             data.blood_group, data.contact, data.address),
        )
    except psycopg2.errors.UniqueViolation:
        raise HTTPException(status_code=409, detail="Duplicate entry")


@router.put("/{patient_id}")
def update_patient(patient_id: int, data: PatientUpdate, user=Depends(require_admin)):
    rows = db_fetch("SELECT * FROM patient WHERE patient_id = %s", (patient_id,))
    if not rows:
        raise HTTPException(status_code=404, detail="Patient not found")
    p = rows[0]
    return db_exec(
        """UPDATE patient SET
               first_name  = %s, last_name   = %s, dob         = %s,
               gender      = %s, blood_group = %s, contact     = %s, address = %s
           WHERE patient_id = %s RETURNING *""",
        (
            data.first_name  or p["first_name"],
            data.last_name   or p["last_name"],
            data.dob         or p["dob"],
            data.gender      or p["gender"],
            data.blood_group or p["blood_group"],
            data.contact     or p["contact"],
            data.address     or p["address"],
            patient_id,
        ),
    )
