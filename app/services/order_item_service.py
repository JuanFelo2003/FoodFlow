from sqlalchemy.orm import Session

from app.models.order import OrderStatus
from app.models.order_item import OrderItem
from app.repositories.menu_item_repository import MenuItemRepository
from app.repositories.order_item_repository import OrderItemRepository
from app.repositories.order_repository import OrderRepository


class OrderItemService:

    def __init__(self, db: Session):
        self.repository = OrderItemRepository(db)
        self.order_repository = OrderRepository(db)
        self.menu_item_repository = MenuItemRepository(db)

    def create_order_item(
        self,
        order_id: int,
        menu_item_id: int,
        quantity: int,
    ) -> OrderItem:
        if order_id <= 0:
            raise ValueError("El ID del pedido debe ser positivo")

        if menu_item_id <= 0:
            raise ValueError("El ID del producto debe ser positivo")

        if quantity <= 0:
            raise ValueError("La cantidad debe ser positiva")

        order = self.order_repository.get_by_id(order_id)

        if order is None:
            raise ValueError("El pedido no existe")

        if order.status != OrderStatus.IN_PROGRESS:
            raise ValueError(
                "No se pueden modificar los items de un pedido que no está en proceso"
            )

        menu_item = self.menu_item_repository.get_by_id(menu_item_id)

        if menu_item is None:
            raise ValueError("El producto no existe")

        if not menu_item.available:
            raise ValueError("El producto no está disponible")

        order_item = OrderItem(
            order_id=order_id,
            menu_item_id=menu_item_id,
            quantity=quantity,
            unit_price=menu_item.price,
        )

        return self.repository.create(order_item)

    def get_order_item(
        self,
        order_item_id: int,
    ) -> OrderItem | None:
        return self.repository.get_by_id(order_item_id)

    def get_order_items(
        self,
        order_id: int,
    ) -> list[OrderItem]:
        if order_id <= 0:
            raise ValueError("El ID del pedido debe ser positivo")

        order = self.order_repository.get_by_id(order_id)

        if order is None:
            raise ValueError("El pedido no existe")

        return self.repository.get_by_order(order_id)

    def update_order_item(
        self,
        order_item_id: int,
        quantity: int,
    ) -> OrderItem:
        if quantity <= 0:
            raise ValueError("La cantidad debe ser positiva")

        order_item = self.repository.get_by_id(order_item_id)

        if order_item is None:
            raise ValueError("El producto del pedido no existe")

        order = self.order_repository.get_by_id(order_item.order_id)

        if order is None:
            raise ValueError("El pedido no existe")

        if order.status != OrderStatus.IN_PROGRESS:
            raise ValueError(
                "No se pueden modificar los items de un pedido que no está en proceso"
            )

        order_item.quantity = quantity

        return self.repository.update(order_item)

    def delete_order_item(self, order_item_id: int) -> None:
        order_item = self.repository.get_by_id(order_item_id)

        if order_item is None:
            raise ValueError("El producto del pedido no existe")

        order = self.order_repository.get_by_id(order_item.order_id)

        if order is None:
            raise ValueError("El pedido no existe")

        if order.status != OrderStatus.IN_PROGRESS:
            raise ValueError(
                "No se pueden modificar los items de un pedido que no está en proceso"
            )

        self.repository.delete(order_item)