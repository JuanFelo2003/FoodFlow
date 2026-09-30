from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.payment import Payment, PaymentStatus


class PaymentRepository:

    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, payment_id: int) -> Payment | None:
        statement = select(Payment).where(Payment.id == payment_id)
        return self.db.scalar(statement)

    def get_by_account(
        self,
        account_id: int,
    ) -> Payment | None:
        statement = select(Payment).where(
            Payment.account_id == account_id,
            Payment.status == PaymentStatus.REGISTERED,
        )
        return self.db.scalar(statement)

    def create(self, payment: Payment) -> Payment:
        self.db.add(payment)
        self.db.commit()
        self.db.refresh(payment)
        return payment

    def update(self, payment: Payment) -> Payment:
        self.db.commit()
        self.db.refresh(payment)
        return payment