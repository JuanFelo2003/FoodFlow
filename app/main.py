from fastapi import FastAPI

from app.routers.auth import router as auth_router
from app.routers.menu_items import router as menu_items_router
from app.routers.tables import router as tables_router


app = FastAPI(
    title="FoodFlow API",
    description="API para el sistema de gestión de restaurantes FoodFlow.",
    version="0.1.0",
)

app.include_router(auth_router)
app.include_router(menu_items_router)
app.include_router(tables_router)
