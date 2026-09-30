from decimal import Decimal, ROUND_HALF_UP

from sqlalchemy.orm import Session

from app.models.order import OrderStatus
from app.models.payment import (
    Payment,
    PaymentMethod,
    PaymentStatus,
)
from app.models.table import TableStatus
from app.repositories.account_repository import AccountRepository
from app.repositories.order_repository import OrderRepository
from app.repositories.payment_repository import PaymentRepository
from app.repositories.table_repository import TableRepository


class PaymentService:

    def __init__(self, db: Session):
        self.repository = PaymentRepository(db)
        self.account_repository = AccountRepository(db)
        self.order_repository = OrderRepository(db)
        self.table_repository = TableRepository(db)

    def create_payment(
        self,
        account_id: int,
        employee_id: int,
        payment_method: PaymentMethod,
        cash_received: Decimal,
    ) -> Payment:
        if account_id <= 0:
            raise ValueError(
                "El ID de la cuenta debe ser positivo"
            )

        if employee_id <= 0:
            raise ValueError(
                "El ID del empleado debe ser positivo"
            )

        if cash_received < 0:
            raise ValueError(
                "El efectivo recibido no puede ser negativo"
            )

        account = self.account_repository.get_by_id(account_id)

        if account is None:
            raise ValueError("La cuenta no existe")

        existing_payment = self.repository.get_by_account(account_id)

        if existing_payment is not None:
            raise ValueError(
                "La cuenta ya tiene un pago registrado"
            )

        order = self.order_repository.get_by_id(account.order_id)

        if order is None:
            raise ValueError("El pedido no existe")

        if order.status != OrderStatus.SERVED:
            raise ValueError(
                "Solo se puede registrar el pago de un pedido servido"
            )

        table = self.table_repository.get_by_id(order.table_id)

        if table is None:
            raise ValueError(
                "La mesa asociada al pedido no existe"
            )

        amount = account.total

        if payment_method == PaymentMethod.CASH:
            if cash_received < amount:
                raise ValueError(
                    "El efectivo recibido es insuficiente"
                )

            change_amount = (
                cash_received - amount
            ).quantize(
                Decimal("0.01"),
                rounding=ROUND_HALF_UP,
            )

        else:
            if cash_received != Decimal("0.00"):
                raise ValueError(
                    "El efectivo recibido debe ser 0 para pagos con tarjeta"
                )

            change_amount = Decimal("0.00")

        payment = Payment(
            account_id=account_id,
            employee_id=employee_id,
            amount=amount,
            payment_method=payment_method,
            cash_received=cash_received,
            change_amount=change_amount,
            status=PaymentStatus.REGISTERED,
        )

        created_payment = self.repository.create(payment)

        order.status = OrderStatus.PAID
        table.status = TableStatus.AVAILABLE

        self.order_repository.update(order)
        self.table_repository.update(table)

        return created_payment

    def get_payment(
        self,
        payment_id: int,
    ) -> Payment | None:
        return self.repository.get_by_id(payment_id)

    def get_payment_by_account(
        self,
        account_id: int,
    ) -> Payment | None:
        return self.repository.get_by_account(account_id)

    def void_payment(
        self,
        payment_id: int,
    ) -> Payment:
        if payment_id <= 0:
            raise ValueError(
                "El ID del pago debe ser positivo"
            )

        payment = self.repository.get_by_id(payment_id)

        if payment is None:
            raise ValueError("El pago no existe")

        if payment.status != PaymentStatus.REGISTERED:
            raise ValueError(
                "El pago ya está anulado"
            )

        account = self.account_repository.get_by_id(
            payment.account_id
        )

        if account is None:
            raise ValueError("La cuenta no existe")

        order = self.order_repository.get_by_id(
            account.order_id
        )

        if order is None:
            raise ValueError("El pedido no existe")

        if order.status != OrderStatus.PAID:
            raise ValueError(
                "Solo se puede anular un pago de un pedido pagado"
            )

        table = self.table_repository.get_by_id(
            order.table_id
        )

        if table is None:
            raise ValueError(
                "La mesa asociada al pedido no existe"
            )

        payment.status = PaymentStatus.VOIDED
        order.status = OrderStatus.SERVED
        table.status = TableStatus.IN_SERVICE

        updated_payment = self.repository.update(payment)
        self.order_repository.update(order)
        self.table_repository.update(table)

        return updated_payment