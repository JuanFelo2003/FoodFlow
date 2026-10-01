from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.order_item import OrderItem


class OrderItemRepository:

    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, order_item_id: int) -> OrderItem | None:
        statement = select(OrderItem).where(OrderItem.id == order_item_id)
        return self.db.scalar(statement)

    def get_by_order(self, order_id: int) -> list[OrderItem]:
        statement = select(OrderItem).where(
            OrderItem.order_id == order_id
        )
        return list(self.db.scalars(statement).all())

    def create(self, order_item: OrderItem) -> OrderItem:
        self.db.add(order_item)
        self.db.commit()
        self.db.refresh(order_item)
        return order_item

    def update(self, order_item: OrderItem) -> OrderItem:
        self.db.commit()
        self.db.refresh(order_item)
        return order_item

    def delete(self, order_item: OrderItem) -> None:
        self.db.delete(order_item)
        self.db.commit()