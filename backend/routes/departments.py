from fastapi import APIRouter, Depends

from db import db_fetch
from dependencies import require_admin

router = APIRouter()


@router.get("/")
def list_departments(user=Depends(require_admin)):
    return db_fetch(
        """SELECT d.*,
               COUNT(hp.hp_id) AS staff_count,
               head.first_name || ' ' || head.last_name AS head_name
           FROM department d
           LEFT JOIN healthcare_professional hp   ON hp.dept_id  = d.dept_id
           LEFT JOIN healthcare_professional head ON head.hp_id  = d.head_hp_id
           GROUP BY d.dept_id, head.first_name, head.last_name
           ORDER BY d.dept_id"""
    )
