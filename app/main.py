from fastapi import FastAPI

from app.routers.auth import router as auth_router
from app.routers.employees import router as employees_router
from app.routers.menu_items import router as menu_items_router
from app.routers.tables import router as tables_router
from app.routers.orders import router as orders_router
from app.routers.order_items import router as order_items_router


app = FastAPI(
    title="FoodFlow API",
    description="API para el sistema de gestión de restaurantes FoodFlow.",
    version="0.1.0",
)

app.include_router(auth_router)
app.include_router(employees_router)
app.include_router(menu_items_router)
app.include_router(tables_router)
app.include_router(orders_router)
app.include_router(order_items_router)