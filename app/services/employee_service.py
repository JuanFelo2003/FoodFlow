from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models.employee import Employee, EmployeeRole
from app.repositories.employee_repository import EmployeeRepository


class EmployeeService:

    def __init__(self, db: Session):
        self.repository = EmployeeRepository(db)

    def create_employee(
        self,
        name: str,
        email: str,
        password: str,
        role: EmployeeRole,
    ) -> Employee:
        existing_employee = self.repository.get_by_email(email)

        if existing_employee is not None:
            raise ValueError("Ya existe un empleado con ese correo")

        if not name.strip():
            raise ValueError("El nombre del empleado es obligatorio")

        if not email.strip():
            raise ValueError("El correo del empleado es obligatorio")

        if not password:
            raise ValueError("La contraseña es obligatoria")

        employee = Employee(
            name=name.strip(),
            email=email.strip(),
            password_hash=hash_password(password),
            role=role,
            active=True,
        )

        return self.repository.create(employee)

    def get_employee(
        self,
        employee_id: int,
    ) -> Employee | None:
        return self.repository.get_by_id(employee_id)

    def get_all_employees(self) -> list[Employee]:
        return self.repository.get_all()

    def update_employee(
        self,
        employee_id: int,
        name: str,
        email: str,
        role: EmployeeRole,
        password: str | None = None,
    ) -> Employee:
        employee = self.repository.get_by_id(employee_id)

        if employee is None:
            raise ValueError("El empleado no existe")

        existing_employee = self.repository.get_by_email(email)

        if (
            existing_employee is not None
            and existing_employee.id != employee_id
        ):
            raise ValueError("Ya existe un empleado con ese correo")

        if not name.strip():
            raise ValueError("El nombre del empleado es obligatorio")

        if not email.strip():
            raise ValueError("El correo del empleado es obligatorio")

        employee.name = name.strip()
        employee.email = email.strip()
        employee.role = role

        if password:
            employee.password_hash = hash_password(password)

        return self.repository.update(employee)

    def update_employee_status(
        self,
        employee_id: int,
        active: bool,
    ) -> Employee:
        employee = self.repository.get_by_id(employee_id)

        if employee is None:
            raise ValueError("El empleado no existe")

        employee.active = active

        return self.repository.update(employee)