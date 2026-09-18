from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.services.auth_service import AuthService

router = APIRouter(
    prefix="/auth",
    tags=["Autenticación"],
)


@router.post("/login")
def login(
    email: str,
    password: str,
    db: Session = Depends(get_db),
):
    auth_service = AuthService(db)

    employee = auth_service.authenticate(email, password)

    if employee is None:
        raise HTTPException(
            status_code=401,
            detail="Credenciales inválidas",
        )

    return {
        "message": "Autenticación exitosa",
        "employee": {
            "id": employee.id,
            "name": employee.name,
            "email": employee.email,
            "role": employee.role.value,
        },
    }