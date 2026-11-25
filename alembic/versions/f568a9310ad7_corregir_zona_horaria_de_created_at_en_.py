
"""corregir zona horaria de created_at en orders

Revision ID: f568a9310ad7
Revises: 20261110supabase
Create Date: 2026-11-24 22:26:58.182749

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'f568a9310ad7'
down_revision: Union[str, Sequence[str], None] = '20261110supabase'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column(
        'orders',
        'created_at',
        existing_type=sa.DateTime(timezone=False),
        type_=sa.DateTime(timezone=True),
        existing_nullable=False,
        postgresql_using="created_at AT TIME ZONE 'UTC'",
    )


def downgrade() -> None:
    op.alter_column(
        'orders',
        'created_at',
        existing_type=sa.DateTime(timezone=True),
        type_=sa.DateTime(timezone=False),
        existing_nullable=False,
        postgresql_using="created_at AT TIME ZONE 'UTC'",
    )
