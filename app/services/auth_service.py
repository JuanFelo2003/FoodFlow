from sqlalchemy.orm import Session

from app.core.security import verify_password
from app.models.employee import Employee
from app.repositories.employee_repository import EmployeeRepository


class AuthService:

    def __init__(self, db: Session):
        self.repository = EmployeeRepository(db)

    def authenticate(self, email: str, password: str) -> Employee | None:
        employee = self.repository.get_by_email(email)

        if employee is None:
            return None

        if not employee.active:
            return None

        if not verify_password(password, employee.password_hash):
            return None

        return employee