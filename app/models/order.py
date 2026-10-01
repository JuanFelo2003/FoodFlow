from enum import Enum
from datetime import datetime

from sqlalchemy import DateTime, Enum as SQLEnum, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class OrderStatus(str, Enum):
    IN_PROGRESS = "en_proceso"
    SERVED = "servida"
    PAID = "pagada"


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    table_id: Mapped[int] = mapped_column(
        ForeignKey("tables.id"),
        nullable=False,
    )

    status: Mapped[OrderStatus] = mapped_column(
        SQLEnum(OrderStatus),
        nullable=False,
        default=OrderStatus.IN_PROGRESS,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
    )