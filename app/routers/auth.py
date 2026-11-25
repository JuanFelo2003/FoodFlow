
import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from supabase import create_client

from app.core.config import settings
from app.db.session import get_db
from app.schemas.auth import LoginRequest, RefreshRequest
from app.services.auth_service import AuthService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["Autenticación"])


@router.post("/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    auth_service = AuthService(db)

    try:
        result = auth_service.authenticate(payload.email, payload.password)
    except Exception:
        logger.exception("Error interno durante la autenticación")
        raise HTTPException(
            status_code=503,
            detail="No fue posible completar la autenticación. Intenta de nuevo.",
        )

    if result is None:
        raise HTTPException(status_code=401, detail="Credenciales inválidas")

    employee, session = result

    return {
        "access_token": session.access_token,
        "refresh_token": session.refresh_token,
        "token_type": "bearer",
        "employee": {
            "id": employee.id,
            "name": employee.name,
            "email": employee.email,
            "role": employee.role.value,
        },
    }


@router.post("/refresh")
def refresh(payload: RefreshRequest):
    try:
        auth_client = create_client(settings.supabase_url, settings.supabase_key)
        response = auth_client.auth.refresh_session(payload.refresh_token)

        if response.session is None:
            raise HTTPException(
                status_code=401,
                detail="La sesión ha expirado. Inicia sesión nuevamente.",
            )

        return {
            "access_token": response.session.access_token,
            "refresh_token": response.session.refresh_token,
            "token_type": "bearer",
        }
    except HTTPException:
        raise
    except Exception:
        logger.exception("Error interno durante la renovación de sesión")
        raise HTTPException(
            status_code=401,
            detail="No fue posible renovar la sesión. Inicia sesión nuevamente.",
        )
