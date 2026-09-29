from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.permissions import require_role
from app.db.session import get_db
from app.models.employee import EmployeeRole
from app.services.employee_service import EmployeeService


router = APIRouter(
    prefix="/employees",
    tags=["Empleados"],
)


@router.get("/")
def get_employees(
    db: Session = Depends(get_db),
    current_employee: dict = Depends(require_role("admin")),
):
    service = EmployeeService(db)

    return service.get_all_employees()


@router.get("/{employee_id}")
def get_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    current_employee: dict = Depends(require_role("admin")),
):
    service = EmployeeService(db)

    employee = service.get_employee(employee_id)

    if employee is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="El empleado no existe",
        )

    return employee


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_employee(
    name: str,
    email: str,
    password: str,
    role: EmployeeRole,
    db: Session = Depends(get_db),
    current_employee: dict = Depends(require_role("admin")),
):
    service = EmployeeService(db)

    try:
        return service.create_employee(
            name=name,
            email=email,
            password=password,
            role=role,
        )
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        )


@router.put("/{employee_id}")
def update_employee(
    employee_id: int,
    name: str,
    email: str,
    role: EmployeeRole,
    password: str | None = None,
    db: Session = Depends(get_db),
    current_employee: dict = Depends(require_role("admin")),
):
    service = EmployeeService(db)

    try:
        return service.update_employee(
            employee_id=employee_id,
            name=name,
            email=email,
            role=role,
            password=password,
        )
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        )


@router.put("/{employee_id}/active")
def update_employee_status(
    employee_id: int,
    active: bool,
    db: Session = Depends(get_db),
    current_employee: dict = Depends(require_role("admin")),
):
    if (
        employee_id == current_employee["employee_id"]
        and not active
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Un administrador no puede desactivarse a sí mismo",
        )

    service = EmployeeService(db)

    try:
        return service.update_employee_status(
            employee_id=employee_id,
            active=active,
        )
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        )