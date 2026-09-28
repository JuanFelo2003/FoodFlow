from sqlalchemy.orm import Session

from app.models.order import Order, OrderStatus
from app.models.table import TableStatus
from app.repositories.order_repository import OrderRepository
from app.repositories.table_repository import TableRepository
from app.repositories.order_item_repository import OrderItemRepository


class OrderService:

    def __init__(self, db: Session):
        self.repository = OrderRepository(db)
        self.table_repository = TableRepository(db)
        self.order_item_repository = OrderItemRepository(db)

    def create_order(self, table_id: int) -> Order:
        if table_id <= 0:
            raise ValueError("El ID de la mesa debe ser positivo")

        table = self.table_repository.get_by_id(table_id)

        if table is None:
            raise ValueError("La mesa no existe")

        if table.status == TableStatus.AVAILABLE:
            raise ValueError("La mesa debe estar ocupada")

        if table.status == TableStatus.IN_SERVICE:
            raise ValueError("La mesa ya tiene un pedido en atención")

        order = Order(
            table_id=table_id,
            status=OrderStatus.IN_PROGRESS,
        )

        table.status = TableStatus.IN_SERVICE

        created_order = self.repository.create(order)
        self.table_repository.update(table)

        return created_order

    def get_order(self, order_id: int) -> Order | None:
        return self.repository.get_by_id(order_id)

    def get_all_orders(self) -> list[Order]:
        return self.repository.get_all()

    def get_orders_by_table(self, table_id: int) -> list[Order]:
        return self.repository.get_by_table(table_id)

    def get_orders_by_status(
        self,
        status: OrderStatus,
    ) -> list[Order]:
        return self.repository.get_by_status(status)

    def update_order_status(
        self,
        order_id: int,
        status: OrderStatus,
    ) -> Order:
        order = self.repository.get_by_id(order_id)

        if order is None:
            raise ValueError("El pedido no existe")

        valid_transitions = {
            OrderStatus.IN_PROGRESS: OrderStatus.SERVED,
            OrderStatus.SERVED: OrderStatus.PAID,
        }

        expected_status = valid_transitions.get(order.status)

        if expected_status != status:
            raise ValueError(
                "Transición de estado no permitida"
            )

        table = self.table_repository.get_by_id(order.table_id)

        if table is None:
            raise ValueError("La mesa asociada al pedido no existe")

        order.status = status

        if status == OrderStatus.PAID:
            table.status = TableStatus.AVAILABLE

        updated_order = self.repository.update(order)

        if status == OrderStatus.PAID:
            self.table_repository.update(table)

        return updated_order

    def delete_order(self, order_id: int) -> None:
        order = self.repository.get_by_id(order_id)

        if order is None:
            raise ValueError("El pedido no existe")

        if order.status != OrderStatus.IN_PROGRESS:
            raise ValueError(
                "Solo se pueden eliminar pedidos que están en proceso"
            )

        table = self.table_repository.get_by_id(order.table_id)

        if table is None:
            raise ValueError("La mesa asociada al pedido no existe")

        order_items = self.order_item_repository.get_by_order(order_id)

        for order_item in order_items:
            self.order_item_repository.delete(order_item)

        self.repository.delete(order)

        table.status = TableStatus.OCCUPIED
        self.table_repository.update(table)