from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.permissions import require_role
from app.db.session import get_db
from app.services.account_service import AccountService


router = APIRouter(
    prefix="/accounts",
    tags=["Cuentas"],
)


@router.get("/{account_id}")
def get_account(
    account_id: int,
    db: Session = Depends(get_db),
    current_employee: dict = Depends(
        require_role("admin", "waiter", "cashier", "kitchen")
    ),
):
    service = AccountService(db)

    account = service.get_account(account_id)

    if account is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="La cuenta no existe",
        )

    return account


@router.get("/order/{order_id}")
def get_account_by_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_employee: dict = Depends(
        require_role("admin", "waiter", "cashier", "kitchen")
    ),
):
    service = AccountService(db)

    account = service.get_account_by_order(order_id)

    if account is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="El pedido no tiene una cuenta",
        )

    return account


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_account(
    order_id: int,
    discount_percentage: Decimal,
    tax_name: str | None,
    tax_percentage: Decimal,
    tip_percentage: Decimal,
    db: Session = Depends(get_db),
    current_employee: dict = Depends(
        require_role("admin", "waiter")
    ),
):
    service = AccountService(db)

    try:
        return service.create_account(
            order_id=order_id,
            discount_percentage=discount_percentage,
            tax_name=tax_name,
            tax_percentage=tax_percentage,
            tip_percentage=tip_percentage,
        )
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        )


@router.put("/{account_id}")
def update_account(
    account_id: int,
    discount_percentage: Decimal,
    tax_name: str | None,
    tax_percentage: Decimal,
    tip_percentage: Decimal,
    db: Session = Depends(get_db),
    current_employee: dict = Depends(
        require_role("admin", "waiter")
    ),
):
    service = AccountService(db)

    try:
        return service.update_account(
            account_id=account_id,
            discount_percentage=discount_percentage,
            tax_name=tax_name,
            tax_percentage=tax_percentage,
            tip_percentage=tip_percentage,
        )
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        )