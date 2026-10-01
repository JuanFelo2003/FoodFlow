from decimal import Decimal, ROUND_HALF_UP

from sqlalchemy.orm import Session

from app.models.account import Account
from app.models.order import OrderStatus
from app.repositories.account_repository import AccountRepository
from app.repositories.order_item_repository import OrderItemRepository
from app.repositories.order_repository import OrderRepository


class AccountService:

    def __init__(self, db: Session):
        self.repository = AccountRepository(db)
        self.order_repository = OrderRepository(db)
        self.order_item_repository = OrderItemRepository(db)

    def create_account(
        self,
        order_id: int,
        discount_percentage: Decimal,
        tax_name: str | None,
        tax_percentage: Decimal,
        tip_percentage: Decimal,
    ) -> Account:
        if order_id <= 0:
            raise ValueError("El ID del pedido debe ser positivo")

        if discount_percentage < 0 or discount_percentage > 100:
            raise ValueError(
                "El porcentaje de descuento debe estar entre 0 y 100"
            )

        if tax_percentage < 0 or tax_percentage > 100:
            raise ValueError(
                "El porcentaje de impuesto debe estar entre 0 y 100"
            )

        if tip_percentage < 0 or tip_percentage > 100:
            raise ValueError(
                "El porcentaje de propina debe estar entre 0 y 100"
            )

        order = self.order_repository.get_by_id(order_id)

        if order is None:
            raise ValueError("El pedido no existe")

        if order.status != OrderStatus.SERVED:
            raise ValueError(
                "Solo se puede crear una cuenta para un pedido servido"
            )

        existing_account = self.repository.get_by_order(order_id)

        if existing_account is not None:
            raise ValueError(
                "El pedido ya tiene una cuenta"
            )

        order_items = self.order_item_repository.get_by_order(order_id)

        if not order_items:
            raise ValueError(
                "El pedido no tiene productos"
            )

        subtotal = sum(
            (
                item.unit_price * item.quantity
                for item in order_items
            ),
            Decimal("0.00"),
        )

        discount_amount = (
            subtotal
            * discount_percentage
            / Decimal("100")
        )

        amount_after_discount = subtotal - discount_amount

        if tax_percentage > 0:
            if not tax_name or not tax_name.strip():
                raise ValueError(
                    "El nombre del impuesto es obligatorio"
                )

            tax_amount = (
                amount_after_discount
                * tax_percentage
                / (Decimal("100") + tax_percentage)
            )

            taxable_amount = amount_after_discount - tax_amount

        else:
            tax_name = None
            tax_amount = Decimal("0.00")
            taxable_amount = amount_after_discount

        tip_amount = (
            amount_after_discount
            * tip_percentage
            / Decimal("100")
        )

        total = amount_after_discount + tip_amount

        subtotal = subtotal.quantize(
            Decimal("0.01"),
            rounding=ROUND_HALF_UP,
        )

        discount_amount = discount_amount.quantize(
            Decimal("0.01"),
            rounding=ROUND_HALF_UP,
        )

        taxable_amount = taxable_amount.quantize(
            Decimal("0.01"),
            rounding=ROUND_HALF_UP,
        )

        tax_amount = tax_amount.quantize(
            Decimal("0.01"),
            rounding=ROUND_HALF_UP,
        )

        tip_amount = tip_amount.quantize(
            Decimal("0.01"),
            rounding=ROUND_HALF_UP,
        )

        total = total.quantize(
            Decimal("0.01"),
            rounding=ROUND_HALF_UP,
        )

        account = Account(
            order_id=order_id,
            subtotal=subtotal,
            discount_percentage=discount_percentage,
            discount_amount=discount_amount,
            taxable_amount=taxable_amount,
            tax_name=tax_name.strip() if tax_name else None,
            tax_percentage=tax_percentage,
            tax_amount=tax_amount,
            tip_percentage=tip_percentage,
            tip_amount=tip_amount,
            total=total,
        )

        return self.repository.create(account)

    def update_account(
        self,
        account_id: int,
        discount_percentage: Decimal,
        tax_name: str | None,
        tax_percentage: Decimal,
        tip_percentage: Decimal,
    ) -> Account:
        if account_id <= 0:
            raise ValueError("El ID de la cuenta debe ser positivo")

        if discount_percentage < 0 or discount_percentage > 100:
            raise ValueError(
                "El porcentaje de descuento debe estar entre 0 y 100"
            )

        if tax_percentage < 0 or tax_percentage > 100:
            raise ValueError(
                "El porcentaje de impuesto debe estar entre 0 y 100"
            )

        if tip_percentage < 0 or tip_percentage > 100:
            raise ValueError(
                "El porcentaje de propina debe estar entre 0 y 100"
            )

        account = self.repository.get_by_id(account_id)

        if account is None:
            raise ValueError("La cuenta no existe")

        order = self.order_repository.get_by_id(account.order_id)

        if order is None:
            raise ValueError("El pedido no existe")

        if order.status != OrderStatus.SERVED:
            raise ValueError(
                "Solo se puede modificar una cuenta de un pedido servido"
            )

        order_items = self.order_item_repository.get_by_order(
            account.order_id
        )

        if not order_items:
            raise ValueError(
                "El pedido no tiene productos"
            )

        subtotal = sum(
            (
                item.unit_price * item.quantity
                for item in order_items
            ),
            Decimal("0.00"),
        )

        discount_amount = (
            subtotal
            * discount_percentage
            / Decimal("100")
        )

        amount_after_discount = subtotal - discount_amount

        if tax_percentage > 0:
            if not tax_name or not tax_name.strip():
                raise ValueError(
                    "El nombre del impuesto es obligatorio"
                )

            tax_amount = (
                amount_after_discount
                * tax_percentage
                / (Decimal("100") + tax_percentage)
            )

            taxable_amount = amount_after_discount - tax_amount

        else:
            tax_name = None
            tax_amount = Decimal("0.00")
            taxable_amount = amount_after_discount

        tip_amount = (
            amount_after_discount
            * tip_percentage
            / Decimal("100")
        )

        total = amount_after_discount + tip_amount

        subtotal = subtotal.quantize(
            Decimal("0.01"),
            rounding=ROUND_HALF_UP,
        )

        discount_amount = discount_amount.quantize(
            Decimal("0.01"),
            rounding=ROUND_HALF_UP,
        )

        taxable_amount = taxable_amount.quantize(
            Decimal("0.01"),
            rounding=ROUND_HALF_UP,
        )

        tax_amount = tax_amount.quantize(
            Decimal("0.01"),
            rounding=ROUND_HALF_UP,
        )

        tip_amount = tip_amount.quantize(
            Decimal("0.01"),
            rounding=ROUND_HALF_UP,
        )

        total = total.quantize(
            Decimal("0.01"),
            rounding=ROUND_HALF_UP,
        )

        account.subtotal = subtotal
        account.discount_percentage = discount_percentage
        account.discount_amount = discount_amount
        account.taxable_amount = taxable_amount
        account.tax_name = tax_name.strip() if tax_name else None
        account.tax_percentage = tax_percentage
        account.tax_amount = tax_amount
        account.tip_percentage = tip_percentage
        account.tip_amount = tip_amount
        account.total = total

        return self.repository.update(account)

    def get_account(
        self,
        account_id: int,
    ) -> Account | None:
        return self.repository.get_by_id(account_id)

    def get_account_by_order(
        self,
        order_id: int,
    ) -> Account | None:
        return self.repository.get_by_order(order_id)