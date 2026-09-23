from fastapi import Depends, FastAPI

from app.core.permissions import require_role
from app.dependencies import get_current_employee
from app.routers.auth import router as auth_router

app = FastAPI(
    title="FoodFlow API",
    description="API para el sistema de gestión de restaurantes FoodFlow.",
    version="0.1.0",
)

app.include_router(auth_router)


@app.get("/")
def root(
    current_employee: dict = Depends(get_current_employee),
):
    return {
        "message": "FoodFlow API funcionando correctamente",
        "employee_id": current_employee["employee_id"],
        "role": current_employee["role"],
    }


@app.get("/admin-test")
def admin_test(
    current_employee: dict = Depends(require_role("admin")),
):
    return {
        "message": "Acceso administrativo autorizado",
        "employee_id": current_employee["employee_id"],
        "role": current_employee["role"],
    }