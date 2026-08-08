"""crear tabla medida

Revision ID: 20260808_0004
Revises: 20260808_0003
Create Date: 2026-08-08

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "20260808_0004"
down_revision: Union[str, None] = "20260808_0003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "medida",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("unidad_medida", sa.String(length=30), nullable=False),
        sa.Column("medida", sa.String(length=30), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.Column("deleted_at", sa.DateTime(), nullable=True),
        sa.UniqueConstraint("unidad_medida", "medida", name="uq_medida_unidad_medida"),
    )


def downgrade() -> None:
    op.drop_table("medida")
