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

        employee = Employee(
            name=name,
            email=email,
            password_hash=hash_password(password),
            role=role,
            active=True,
        )

        return self.repository.create(employee)