from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.permissions import require_role
from app.db.session import get_db
from app.models.payment import PaymentMethod
from app.services.payment_service import PaymentService


router = APIRouter(
    prefix="/payments",
    tags=["Pagos"],
)


@router.get("/{payment_id}")
def get_payment(
    payment_id: int,
    db: Session = Depends(get_db),
    current_employee: dict = Depends(
        require_role("admin", "waiter", "cashier", "kitchen")
    ),
):
    service = PaymentService(db)

    payment = service.get_payment(payment_id)

    if payment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="El pago no existe",
        )

    return payment


@router.get("/account/{account_id}")
def get_payment_by_account(
    account_id: int,
    db: Session = Depends(get_db),
    current_employee: dict = Depends(
        require_role("admin", "waiter", "cashier", "kitchen")
    ),
):
    service = PaymentService(db)

    payment = service.get_payment_by_account(account_id)

    if payment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="La cuenta no tiene un pago registrado",
        )

    return payment


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_payment(
    account_id: int,
    payment_method: PaymentMethod,
    cash_received: Decimal = Decimal("0.00"),
    db: Session = Depends(get_db),
    current_employee: dict = Depends(
        require_role("admin", "cashier")
    ),
):
    service = PaymentService(db)

    try:
        return service.create_payment(
            account_id=account_id,
            employee_id=current_employee["employee_id"],
            payment_method=payment_method,
            cash_received=cash_received,
        )
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        )


@router.post("/{payment_id}/void")
def void_payment(
    payment_id: int,
    db: Session = Depends(get_db),
    current_employee: dict = Depends(
        require_role("admin", "cashier")
    ),
):
    service = PaymentService(db)

    try:
        return service.void_payment(payment_id)
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        )