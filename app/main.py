from fastapi import FastAPI

from app.routers.auth import router as auth_router

app = FastAPI(
    title="FoodFlow API",
    description="API para el sistema de gestión de restaurantes FoodFlow.",
    version="0.1.0",
)

app.include_router(auth_router)


@app.get("/")
def root():
    return {"message": "FoodFlow API funcionando correctamente"}