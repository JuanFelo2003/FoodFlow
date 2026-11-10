from uuid import UUID

from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.core.supabase import supabase_admin
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

        # Los empleados nuevos se crean directamente en Supabase Auth.
        auth_response = supabase_admin.auth.admin.create_user(
            {
                "email": email.strip(),
                "password": password,
                "email_confirm": True,
            }
        )

        if auth_response.user is None:
            raise RuntimeError("Supabase Auth no devolvió el usuario creado.")

        employee = Employee(
            name=name.strip(),
            email=email.strip(),
            password_hash=None,
            auth_user_id=UUID(str(auth_response.user.id)),
            role=role,
            active=True,
        )

        try:
            return self.repository.create(employee)
        except Exception:
            try:
                supabase_admin.auth.admin.delete_user(
                    str(auth_response.user.id)
                )
            except Exception:
                pass
            raise

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

        new_email = email.strip()

        # Mantiene sincronizados el correo y la contraseña de Auth
        # cuando el empleado ya fue vinculado a Supabase.
        if employee.auth_user_id is not None:
            attributes = {
                "email": new_email,
                "email_confirm": True,
            }
            if password:
                attributes["password"] = password

            supabase_admin.auth.admin.update_user_by_id(
                str(employee.auth_user_id),
                attributes,
            )
        elif password:
            # Empleado antiguo que aún no ha iniciado sesión y migrado.
            employee.password_hash = hash_password(password)

        employee.name = name.strip()
        employee.email = new_email
        employee.role = role

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
