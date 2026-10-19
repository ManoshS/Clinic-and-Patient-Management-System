from fastapi import APIRouter, Depends

from db import db_fetch
from dependencies import require_admin

router = APIRouter()


@router.get("/")
def get_stats(user=Depends(require_admin)):
    row = db_fetch(
        """SELECT
               (SELECT COUNT(*) FROM patient)                                         AS total_patients,
               (SELECT COUNT(*) FROM appointment)                                     AS total_appointments,
               (SELECT COUNT(*) FROM appointment WHERE status = 'scheduled')          AS scheduled_appointments,
               (SELECT COUNT(*) FROM lab_investigation WHERE status = 'pending')      AS pending_labs"""
    )
    return row[0]
