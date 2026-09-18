from enum import Enum

from sqlalchemy import Boolean, Enum as SQLEnum, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class EmployeeRole(str, Enum):
    ADMIN = "admin"
    WAITER = "waiter"
    CASHIER = "cashier"
    KITCHEN = "kitchen"


class Employee(Base):
    __tablename__ = "employees"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(
        String(150),
        unique=True,
        nullable=False,
    )
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[EmployeeRole] = mapped_column(
        SQLEnum(EmployeeRole),
        nullable=False,
    )
    active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)