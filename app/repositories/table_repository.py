from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.table import Table, TableStatus


class TableRepository:

    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, table_id: int) -> Table | None:
        statement = select(Table).where(Table.id == table_id)
        return self.db.scalar(statement)

    def get_all(self) -> list[Table]:
        statement = select(Table)
        return list(self.db.scalars(statement).all())

    def get_by_status(self, status: TableStatus) -> list[Table]:
        statement = select(Table).where(Table.status == status)
        return list(self.db.scalars(statement).all())

    def create(self, table: Table) -> Table:
        self.db.add(table)
        self.db.commit()
        self.db.refresh(table)
        return table

    def update(self, table: Table) -> Table:
        self.db.commit()
        self.db.refresh(table)
        return table

    def delete(self, table: Table) -> None:
        self.db.delete(table)
        self.db.commit()
