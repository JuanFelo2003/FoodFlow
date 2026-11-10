from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.supabase import supabase
from app.db.session import get_db
from app.repositories.employee_repository import EmployeeRepository


security = HTTPBearer()


def get_current_employee(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> dict:
    token = credentials.credentials

    try:
        response = supabase.auth.get_user(token)
        auth_user = response.user

        if auth_user is None:
            raise ValueError("El token no corresponde a un usuario.")

        auth_user_id = UUID(str(auth_user.id))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )

    repository = EmployeeRepository(db)
    employee = repository.get_by_auth_user_id(auth_user_id)

    if employee is None or not employee.active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Empleado inactivo, inexistente o no vinculado",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # El rol siempre se consulta en PostgreSQL, nunca se confía en
    # información de rol enviada dentro del JWT.
    return {
        "employee_id": employee.id,
        "role": employee.role.value,
    }
