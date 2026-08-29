"""categoría opcional en artículo

Revision ID: 20260824_0001
Revises: 20260820_0002
Create Date: 2026-08-24

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "20260824_0001"
down_revision: Union[str, None] = "20260820_0002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column("articulo", "categoria_id", existing_type=sa.Uuid(), nullable=True)


def downgrade() -> None:
    op.alter_column("articulo", "categoria_id", existing_type=sa.Uuid(), nullable=False)
