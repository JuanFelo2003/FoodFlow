from enum import Enum

from sqlalchemy import Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class TableStatus(str, Enum):
    AVAILABLE = "disponible"
    OCCUPIED = "ocupada"
    IN_SERVICE = "en_atencion"


class Table(Base):
    __tablename__ = "tables"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    number: Mapped[int] = mapped_column(
        unique=True,
        nullable=False,
    )

    status: Mapped[TableStatus] = mapped_column(
        SQLEnum(TableStatus),
        nullable=False,
        default=TableStatus.AVAILABLE,
    )
