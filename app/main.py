from fastapi import FastAPI

app = FastAPI(
    title="FoodFlow API",
    description="API para el sistema de gestión de restaurantes FoodFlow.",
    version="0.1.0",
)


@app.get("/")
def root():
    return {"message": "FoodFlow API funcionando correctamente"}