from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.permissions import require_role
from app.db.session import get_db
from app.services.order_item_service import OrderItemService


router = APIRouter(
    prefix="/order-items",
    tags=["Items de pedidos"],
)


@router.get("/order/{order_id}")
def get_order_items(
    order_id: int,
    db: Session = Depends(get_db),
    current_employee: dict = Depends(
        require_role("admin", "waiter", "cashier", "kitchen")
    ),
):
    service = OrderItemService(db)

    try:
        return service.get_order_items(order_id)
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        )


@router.get("/{order_item_id}")
def get_order_item(
    order_item_id: int,
    db: Session = Depends(get_db),
    current_employee: dict = Depends(
        require_role("admin", "waiter", "cashier", "kitchen")
    ),
):
    service = OrderItemService(db)

    order_item = service.get_order_item(order_item_id)

    if order_item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="El producto del pedido no existe",
        )

    return order_item


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_order_item(
    order_id: int,
    menu_item_id: int,
    quantity: int,
    db: Session = Depends(get_db),
    current_employee: dict = Depends(
        require_role("admin", "waiter")
    ),
):
    service = OrderItemService(db)

    try:
        return service.create_order_item(
            order_id=order_id,
            menu_item_id=menu_item_id,
            quantity=quantity,
        )
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        )


@router.put("/{order_item_id}")
def update_order_item(
    order_item_id: int,
    quantity: int,
    db: Session = Depends(get_db),
    current_employee: dict = Depends(
        require_role("admin", "waiter")
    ),
):
    service = OrderItemService(db)

    try:
        return service.update_order_item(
            order_item_id=order_item_id,
            quantity=quantity,
        )
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        )


@router.delete(
    "/{order_item_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_order_item(
    order_item_id: int,
    db: Session = Depends(get_db),
    current_employee: dict = Depends(
        require_role("admin", "waiter")
    ),
):
    service = OrderItemService(db)

    try:
        service.delete_order_item(order_item_id)
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        )