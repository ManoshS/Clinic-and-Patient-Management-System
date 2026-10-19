from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    try:
        from auth import decode_token
        payload = decode_token(token)
        return payload  # {user_id, role, patient_id, exp}
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


def require_admin(user: dict = Depends(get_current_user)) -> dict:
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


def require_patient_access(patient_id: int, user: dict = Depends(get_current_user)) -> dict:
    if user.get("role") == "patient" and user.get("patient_id") != patient_id:
        raise HTTPException(status_code=403, detail="Access denied")
    return user
