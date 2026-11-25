"""Add Supabase Auth identity to employees.

Revision ID: 20261110supabase
Revises: e17f7a97b86d
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "20261110supabase"
down_revision: Union[str, Sequence[str], None] = "e17f7a97b86d"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "employees",
        sa.Column(
            "auth_user_id",
            postgresql.UUID(as_uuid=True),
            nullable=True,
        ),
    )
    op.create_unique_constraint(
        "uq_employees_auth_user_id",
        "employees",
        ["auth_user_id"],
    )
    op.alter_column(
        "employees",
        "password_hash",
        existing_type=sa.String(length=255),
        nullable=True,
    )


def downgrade() -> None:
    bind = op.get_bind()
    has_migrated_employees = bind.execute(
        sa.text(
            "SELECT EXISTS "
            "(SELECT 1 FROM employees WHERE auth_user_id IS NOT NULL "
            "AND password_hash IS NULL)"
        )
    ).scalar()

    if has_migrated_employees:
        raise RuntimeError(
            "No se puede revertir: hay empleados autenticados mediante "
            "Supabase que ya no tienen password_hash local."
        )

    op.alter_column(
        "employees",
        "password_hash",
        existing_type=sa.String(length=255),
        nullable=False,
    )
    op.drop_constraint(
        "uq_employees_auth_user_id",
        "employees",
        type_="unique",
    )
    op.drop_column("employees", "auth_user_id")
