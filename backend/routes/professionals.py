from typing import Optional

from fastapi import APIRouter, Depends

from db import db_fetch
from dependencies import require_admin

router = APIRouter()


@router.get("/")
def list_professionals(
    dept_id: Optional[int] = None,
    role: Optional[str] = None,
    user=Depends(require_admin),
):
    clauses, params = [], []
    if dept_id:
        clauses.append("hp.dept_id = %s")
        params.append(dept_id)
    if role:
        clauses.append("hp.role ILIKE %s")
        params.append(role)
    where = ("WHERE " + " AND ".join(clauses)) if clauses else ""
    return db_fetch(
        f"""SELECT hp.*, d.dept_name
            FROM healthcare_professional hp
            LEFT JOIN department d ON d.dept_id = hp.dept_id
            {where}
            ORDER BY hp.hp_id""",
        tuple(params),
    )
