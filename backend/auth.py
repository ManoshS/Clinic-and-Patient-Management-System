import os
from datetime import datetime, timedelta, timezone

import bcrypt
from fastapi import APIRouter, Depends, HTTPException
from jose import JWTError, jwt

from db import db_fetch, db_exec, db_run
from dependencies import get_current_user
from models import LoginRequest, RegisterRequest, TokenResponse

router = APIRouter()

_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "480"))


def _secret():
    s = os.getenv("JWT_SECRET")
    if not s:
        raise RuntimeError("JWT_SECRET not set")
    return s


def hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode(), bcrypt.gensalt(12)).decode()


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())


def create_token(data: dict) -> str:
    payload = data.copy()
    payload["exp"] = datetime.now(tz=timezone.utc) + timedelta(minutes=_EXPIRE_MINUTES)
    return jwt.encode(payload, _secret(), algorithm=_ALGORITHM)


def decode_token(token: str) -> dict:
    return jwt.decode(token, _secret(), algorithms=[_ALGORITHM])


@router.post("/register", status_code=201)
def register(data: RegisterRequest):
    if data.role not in ("admin", "patient"):
        raise HTTPException(status_code=400, detail="role must be 'admin' or 'patient'")

    # check username taken
    if db_fetch("SELECT 1 FROM user_account WHERE username = %s", (data.username,)):
        raise HTTPException(status_code=409, detail="Username already taken")

    patient_id = None

    if data.role == "patient":
        if not data.first_name or not data.last_name:
            raise HTTPException(status_code=400, detail="first_name and last_name are required for patient registration")
        row = db_exec(
            """INSERT INTO patient (first_name, last_name, dob, gender, blood_group, contact, address)
               VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING patient_id""",
            (data.first_name, data.last_name, data.dob or None, data.gender or None,
             data.blood_group or None, data.contact or None, data.address or None),
        )
        patient_id = row["patient_id"]

    db_run(
        """INSERT INTO user_account (username, password_hash, role, patient_id)
           VALUES (%s, %s, %s, %s)""",
        (data.username, hash_password(data.password), data.role, patient_id),
    )
    return {"message": "Account created successfully"}


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest):
    rows = db_fetch(
        "SELECT * FROM user_account WHERE username = %s AND is_active = TRUE",
        (data.username,),
    )
    if not rows or not verify_password(data.password, rows[0]["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    user = rows[0]
    token = create_token({
        "user_id": user["user_id"],
        "role": user["role"],
        "patient_id": user["patient_id"],
    })
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": user["role"],
        "patient_id": user["patient_id"],
    }


@router.post("/logout")
def logout():
    return {"message": "Logged out"}


@router.get("/me")
def me(user=Depends(get_current_user)):
    return user
