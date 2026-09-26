from sqlalchemy.orm import Session

from app.models.table import Table, TableStatus
from app.repositories.table_repository import TableRepository


class TableService:

    def __init__(self, db: Session):
        self.repository = TableRepository(db)

    def create_table(self, number: int) -> Table:
        if number <= 0:
            raise ValueError("El número de mesa debe ser positivo")

        existing_tables = self.repository.get_all()

        if any(table.number == number for table in existing_tables):
            raise ValueError("El número de mesa ya existe")

        table = Table(
            number=number,
            status=TableStatus.AVAILABLE,
        )

        return self.repository.create(table)

    def get_table(self, table_id: int) -> Table | None:
        return self.repository.get_by_id(table_id)

    def get_all_tables(self) -> list[Table]:
        return self.repository.get_all()

    def get_tables_by_status(
        self,
        status: TableStatus,
    ) -> list[Table]:
        return self.repository.get_by_status(status)

    def update_table_status(
        self,
        table_id: int,
        status: TableStatus,
    ) -> Table:
        table = self.repository.get_by_id(table_id)

        if table is None:
            raise ValueError("La mesa no existe")

        table.status = status

        return self.repository.update(table)

    def delete_table(self, table_id: int) -> None:
        table = self.repository.get_by_id(table_id)

        if table is None:
            raise ValueError("La mesa no existe")

        self.repository.delete(table)
