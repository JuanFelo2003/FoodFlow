from decimal import Decimal

from sqlalchemy.orm import Session

from app.models.menu_item import MenuItem
from app.repositories.menu_item_repository import MenuItemRepository


class MenuItemService:

    def __init__(self, db: Session):
        self.repository = MenuItemRepository(db)

    def create_menu_item(
        self,
        name: str,
        description: str | None,
        price: Decimal,
        available: bool = True,
        image_url: str | None = None,
    ) -> MenuItem:
        if not name.strip():
            raise ValueError("El nombre del producto es obligatorio")

        if price < Decimal("0"):
            raise ValueError("El precio no puede ser negativo")

        menu_item = MenuItem(
            name=name.strip(),
            description=description,
            price=price,
            available=available,
            image_url=image_url,
        )

        return self.repository.create(menu_item)

    def get_menu_item(self, menu_item_id: int) -> MenuItem | None:
        return self.repository.get_by_id(menu_item_id)

    def get_all_menu_items(self) -> list[MenuItem]:
        return self.repository.get_all()

    def get_available_menu_items(self) -> list[MenuItem]:
        return self.repository.get_available()

    def update_menu_item(
        self,
        menu_item_id: int,
        name: str,
        description: str | None,
        price: Decimal,
        available: bool,
        image_url: str | None = None,
    ) -> MenuItem:
        menu_item = self.repository.get_by_id(menu_item_id)

        if menu_item is None:
            raise ValueError("El producto no existe")

        if not name.strip():
            raise ValueError("El nombre del producto es obligatorio")

        if price < Decimal("0"):
            raise ValueError("El precio no puede ser negativo")

        menu_item.name = name.strip()
        menu_item.description = description
        menu_item.price = price
        menu_item.available = available
        menu_item.image_url = image_url

        return self.repository.update(menu_item)

    def delete_menu_item(self, menu_item_id: int) -> None:
        menu_item = self.repository.get_by_id(menu_item_id)

        if menu_item is None:
            raise ValueError("El producto no existe")

        self.repository.delete(menu_item)