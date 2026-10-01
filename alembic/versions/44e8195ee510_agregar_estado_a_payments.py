"""agregar estado a payments

Revision ID: 44e8195ee510
Revises: 31ed19283a1b
Create Date: 2026-09-29 00:15:07.101850

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "44e8195ee510"
down_revision: Union[str, Sequence[str], None] = "31ed19283a1b"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


payment_status_enum = sa.Enum(
    "REGISTERED",
    "VOIDED",
    name="paymentstatus",
)


def upgrade() -> None:
    """Upgrade schema."""
    payment_status_enum.create(op.get_bind(), checkfirst=True)

    op.add_column(
        "payments",
        sa.Column(
            "status",
            payment_status_enum,
            nullable=False,
            server_default="REGISTERED",
        ),
    )

    op.alter_column(
        "payments",
        "status",
        server_default=None,
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("payments", "status")

    payment_status_enum.drop(
        op.get_bind(),
        checkfirst=True,
    )
