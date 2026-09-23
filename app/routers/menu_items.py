from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.permissions import require_role
from app.db.session import get_db
from app.services.menu_item_service import MenuItemService


router = APIRouter(
    prefix="/menu-items",
    tags=["Menú"],
)


@router.get("/")
def get_menu_items(
    db: Session = Depends(get_db),
    current_employee: dict = Depends(
        require_role("admin", "waiter", "cashier", "kitchen")
    ),
):
    service = MenuItemService(db)

    return service.get_all_menu_items()


@router.get("/available")
def get_available_menu_items(
    db: Session = Depends(get_db),
    current_employee: dict = Depends(
        require_role("admin", "waiter", "cashier", "kitchen")
    ),
):
    service = MenuItemService(db)

    return service.get_available_menu_items()


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_menu_item(
    name: str,
    price: Decimal,
    description: str | None = None,
    available: bool = True,
    image_url: str | None = None,
    db: Session = Depends(get_db),
    current_employee: dict = Depends(require_role("admin")),
):
    service = MenuItemService(db)

    try:
        return service.create_menu_item(
            name=name,
            description=description,
            price=price,
            available=available,
            image_url=image_url,
        )
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        )


@router.put("/{menu_item_id}")
def update_menu_item(
    menu_item_id: int,
    name: str,
    price: Decimal,
    description: str | None = None,
    available: bool = True,
    image_url: str | None = None,
    db: Session = Depends(get_db),
    current_employee: dict = Depends(require_role("admin")),
):
    service = MenuItemService(db)

    try:
        return service.update_menu_item(
            menu_item_id=menu_item_id,
            name=name,
            description=description,
            price=price,
            available=available,
            image_url=image_url,
        )
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        )


@router.delete("/{menu_item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_menu_item(
    menu_item_id: int,
    db: Session = Depends(get_db),
    current_employee: dict = Depends(require_role("admin")),
):
    service = MenuItemService(db)

    try:
        service.delete_menu_item(menu_item_id)
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        )