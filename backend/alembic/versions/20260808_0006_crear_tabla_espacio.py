"""crear tabla espacio

Revision ID: 20260808_0006
Revises: 20260808_0005
Create Date: 2026-08-08

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "20260808_0006"
down_revision: Union[str, None] = "20260808_0005"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "espacio",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("tipo", sa.String(length=50), nullable=True),
        sa.Column("descripcion", sa.Text(), nullable=True),
        sa.Column("deposito_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("max_fila", sa.Integer(), nullable=True),
        sa.Column("max_columna", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.Column("deleted_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["deposito_id"], ["deposito.id"]),
    )
    op.create_index("ix_espacio_deposito_id", "espacio", ["deposito_id"])


def downgrade() -> None:
    op.drop_table("espacio")
