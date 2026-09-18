from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.employee import Employee


class EmployeeRepository:

    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, employee_id: int) -> Employee | None:
        statement = select(Employee).where(Employee.id == employee_id)
        return self.db.scalar(statement)

    def get_by_email(self, email: str) -> Employee | None:
        statement = select(Employee).where(Employee.email == email)
        return self.db.scalar(statement)

    def get_all(self) -> list[Employee]:
        statement = select(Employee)
        return list(self.db.scalars(statement).all())

    def create(self, employee: Employee) -> Employee:
        self.db.add(employee)
        self.db.commit()
        self.db.refresh(employee)
        return employee

    def update(self, employee: Employee) -> Employee:
        self.db.commit()
        self.db.refresh(employee)
        return employee