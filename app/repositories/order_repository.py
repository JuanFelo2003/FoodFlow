from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.order import Order, OrderStatus


class OrderRepository:

    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, order_id: int) -> Order | None:
        statement = select(Order).where(Order.id == order_id)
        return self.db.scalar(statement)

    def get_all(self) -> list[Order]:
        statement = select(Order)
        return list(self.db.scalars(statement).all())

    def get_by_table(self, table_id: int) -> list[Order]:
        statement = select(Order).where(Order.table_id == table_id)
        return list(self.db.scalars(statement).all())

    def get_by_status(self, status: OrderStatus) -> list[Order]:
        statement = select(Order).where(Order.status == status)
        return list(self.db.scalars(statement).all())

    def create(self, order: Order) -> Order:
        self.db.add(order)
        self.db.commit()
        self.db.refresh(order)
        return order

    def update(self, order: Order) -> Order:
        self.db.commit()
        self.db.refresh(order)
        return order

    def delete(self, order: Order) -> None:
        self.db.delete(order)
        self.db.commit()