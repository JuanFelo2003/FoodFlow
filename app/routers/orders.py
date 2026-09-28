from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.permissions import require_role
from app.db.session import get_db
from app.models.order import OrderStatus
from app.services.order_service import OrderService


router = APIRouter(
    prefix="/orders",
    tags=["Pedidos"],
)


@router.get("/")
def get_orders(
    db: Session = Depends(get_db),
    current_employee: dict = Depends(
        require_role("admin", "waiter", "cashier", "kitchen")
    ),
):
    service = OrderService(db)

    return service.get_all_orders()


@router.get("/table/{table_id}")
def get_orders_by_table(
    table_id: int,
    db: Session = Depends(get_db),
    current_employee: dict = Depends(
        require_role("admin", "waiter", "cashier", "kitchen")
    ),
):
    service = OrderService(db)

    return service.get_orders_by_table(table_id)


@router.get("/status/{order_status}")
def get_orders_by_status(
    order_status: OrderStatus,
    db: Session = Depends(get_db),
    current_employee: dict = Depends(
        require_role("admin", "waiter", "cashier", "kitchen")
    ),
):
    service = OrderService(db)

    return service.get_orders_by_status(order_status)


@router.get("/{order_id}")
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_employee: dict = Depends(
        require_role("admin", "waiter", "cashier", "kitchen")
    ),
):
    service = OrderService(db)

    order = service.get_order(order_id)

    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="El pedido no existe",
        )

    return order


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_order(
    table_id: int,
    db: Session = Depends(get_db),
    current_employee: dict = Depends(
        require_role("admin", "waiter")
    ),
):
    service = OrderService(db)

    try:
        return service.create_order(table_id)
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        )


@router.put("/{order_id}/status")
def update_order_status(
    order_id: int,
    order_status: OrderStatus,
    db: Session = Depends(get_db),
    current_employee: dict = Depends(
        require_role("admin", "waiter", "cashier")
    ),
):
    if (
        order_status == OrderStatus.PAID
        and current_employee["role"] not in ("admin", "cashier")
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo el cajero o administrador pueden registrar el pago",
        )

    service = OrderService(db)

    try:
        return service.update_order_status(
            order_id=order_id,
            status=order_status,
        )
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        )


@router.delete(
    "/{order_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_employee: dict = Depends(require_role("admin", "waiter")),
):
    service = OrderService(db)

    try:
        service.delete_order(order_id)
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        )