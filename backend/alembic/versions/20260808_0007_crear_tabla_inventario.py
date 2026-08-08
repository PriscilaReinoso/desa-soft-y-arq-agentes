"""crear tabla inventario

Revision ID: 20260808_0007
Revises: 20260808_0006
Create Date: 2026-08-08

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "20260808_0007"
down_revision: Union[str, None] = "20260808_0006"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "inventario",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("articulo_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("medida_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("espacio_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("fila", sa.Integer(), nullable=True),
        sa.Column("columna", sa.Integer(), nullable=True),
        sa.Column("stock", sa.Integer(), nullable=False),
        sa.Column("precio_venta", sa.Numeric(12, 2), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.Column("deleted_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["articulo_id"], ["articulo.id"]),
        sa.ForeignKeyConstraint(["medida_id"], ["medida.id"]),
        sa.ForeignKeyConstraint(["espacio_id"], ["espacio.id"]),
        sa.UniqueConstraint("articulo_id", "medida_id", name="uq_inventario_articulo_medida"),
        sa.CheckConstraint("stock >= 0", name="ck_inventario_stock_positivo"),
        sa.CheckConstraint("precio_venta >= 0", name="ck_inventario_precio_positivo"),
    )
    op.create_index("ix_inventario_articulo_id", "inventario", ["articulo_id"])
    op.create_index("ix_inventario_medida_id", "inventario", ["medida_id"])
    op.create_index("ix_inventario_espacio_id", "inventario", ["espacio_id"])


def downgrade() -> None:
    op.drop_table("inventario")
