from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.permissions import require_role
from app.db.session import get_db
from app.schemas.employee import EmployeeCreate, EmployeeRead, EmployeeUpdate
from app.services.employee_service import EmployeeService

router = APIRouter(prefix="/employees", tags=["Empleados"])


@router.get("/", response_model=list[EmployeeRead])
def get_employees(
    db: Session = Depends(get_db),
    current_employee: dict = Depends(require_role("admin")),
):
    return EmployeeService(db).get_all_employees()


@router.get("/{employee_id}", response_model=EmployeeRead)
def get_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    current_employee: dict = Depends(require_role("admin")),
):
    employee = EmployeeService(db).get_employee(employee_id)
    if employee is None:
        raise HTTPException(status_code=404, detail="El empleado no existe")
    return employee


@router.post("/", status_code=status.HTTP_201_CREATED, response_model=EmployeeRead)
def create_employee(
    payload: EmployeeCreate,
    db: Session = Depends(get_db),
    current_employee: dict = Depends(require_role("admin")),
):
    try:
        return EmployeeService(db).create_employee(
            name=payload.name,
            email=payload.email,
            password=payload.password,
            role=payload.role,
        )
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))


@router.put("/{employee_id}", response_model=EmployeeRead)
def update_employee(
    employee_id: int,
    payload: EmployeeUpdate,
    db: Session = Depends(get_db),
    current_employee: dict = Depends(require_role("admin")),
):
    try:
        return EmployeeService(db).update_employee(
            employee_id=employee_id,
            name=payload.name,
            email=payload.email,
            role=payload.role,
            password=payload.password,
        )
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))


@router.put("/{employee_id}/active", response_model=EmployeeRead)
def update_employee_status(
    employee_id: int,
    active: bool,
    db: Session = Depends(get_db),
    current_employee: dict = Depends(require_role("admin")),
):
    if employee_id == current_employee["employee_id"] and not active:
        raise HTTPException(
            status_code=400,
            detail="Un administrador no puede desactivarse a sí mismo",
        )
    try:
        return EmployeeService(db).update_employee_status(employee_id, active)
    except ValueError as error:
        raise HTTPException(status_code=404, detail=str(error))
