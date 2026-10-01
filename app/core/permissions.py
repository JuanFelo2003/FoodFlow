from fastapi import Depends, HTTPException, status

from app.dependencies import get_current_employee


def require_role(*allowed_roles: str):
    def role_checker(
        current_employee: dict = Depends(get_current_employee),
    ) -> dict:
        if current_employee["role"] not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permisos para realizar esta acción",
            )

        return current_employee

    return role_checker