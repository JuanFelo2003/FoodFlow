from uuid import UUID

from supabase import create_client
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import verify_password
from app.core.supabase import supabase_admin
from app.models.employee import Employee
from app.repositories.employee_repository import EmployeeRepository


class AuthService:

    def __init__(self, db: Session):
        self.db = db
        self.repository = EmployeeRepository(db)

    def authenticate(self, email: str, password: str):
        employee = self.repository.get_by_email(email)

        if employee is None or not employee.active:
            return None

        # Migración gradual: el primer inicio de sesión válido conserva
        # la contraseña actual y crea la identidad correspondiente en Supabase Auth.
        if employee.auth_user_id is None:
            if not employee.password_hash:
                return None

            if not verify_password(password, employee.password_hash):
                return None

            created_user = supabase_admin.auth.admin.create_user(
                {
                    "email": employee.email,
                    "password": password,
                    "email_confirm": True,
                }
            )

            if created_user.user is None:
                raise RuntimeError(
                    "Supabase Auth no devolvió la identidad creada."
                )

            auth_user_id = UUID(str(created_user.user.id))
            employee.auth_user_id = auth_user_id
            employee.password_hash = None

            try:
                self.repository.update(employee)
            except Exception:
                # Evita dejar una identidad huérfana si falla el vínculo local.
                try:
                    supabase_admin.auth.admin.delete_user(str(auth_user_id))
                except Exception:
                    pass
                raise

        # Se crea un cliente por inicio de sesión para evitar compartir
        # el estado de sesión entre solicitudes concurrentes.
        auth_client = create_client(
            settings.supabase_url,
            settings.supabase_key,
        )
        try:
            auth_response = auth_client.auth.sign_in_with_password(
                {
                    "email": employee.email,
                    "password": password,
                }
            )
        except Exception as error:
            if getattr(error, "code", None) == "invalid_credentials":
                return None
            raise

        if auth_response.session is None:
            return None

        return employee, auth_response.session
