from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.menu_item import MenuItem


class MenuItemRepository:

    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, menu_item_id: int) -> MenuItem | None:
        statement = select(MenuItem).where(MenuItem.id == menu_item_id)
        return self.db.scalar(statement)

    def get_all(self) -> list[MenuItem]:
        statement = select(MenuItem)
        return list(self.db.scalars(statement).all())

    def get_available(self) -> list[MenuItem]:
        statement = select(MenuItem).where(MenuItem.available.is_(True))
        return list(self.db.scalars(statement).all())

    def create(self, menu_item: MenuItem) -> MenuItem:
        self.db.add(menu_item)
        self.db.commit()
        self.db.refresh(menu_item)
        return menu_item

    def update(self, menu_item: MenuItem) -> MenuItem:
        self.db.commit()
        self.db.refresh(menu_item)
        return menu_item

    def delete(self, menu_item: MenuItem) -> None:
        self.db.delete(menu_item)
        self.db.commit()