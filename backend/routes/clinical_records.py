from fastapi import APIRouter, Depends

from db import db_fetch
from dependencies import require_patient_access, get_current_user

router = APIRouter()


@router.get("/{patient_id}")
def list_records(patient_id: int, user=Depends(get_current_user)):
    require_patient_access(patient_id, user)
    return db_fetch(
        """SELECT cr.*,
               hp.first_name || ' ' || hp.last_name AS doctor_name,
               hp.specialization
           FROM clinical_record cr
           JOIN healthcare_professional hp ON hp.hp_id = cr.hp_id
           WHERE cr.patient_id = %s
           ORDER BY cr.visit_date DESC""",
        (patient_id,),
    )
