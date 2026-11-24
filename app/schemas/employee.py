from pydantic import BaseModel, ConfigDict, Field

from app.models.employee import EmployeeRole


class EmployeeCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: str = Field(min_length=3, max_length=150, pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    password: str = Field(min_length=1)
    role: EmployeeRole


class EmployeeUpdate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: str = Field(min_length=3, max_length=150, pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    role: EmployeeRole
    password: str | None = None


class EmployeeRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: str
    role: EmployeeRole
    active: bool
