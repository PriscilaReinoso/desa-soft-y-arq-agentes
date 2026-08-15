"""agregar minimo_stock y medida_venta a inventario

Revision ID: 20260815_0001
Revises: 20260808_0007
Create Date: 2026-08-15

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "20260815_0001"
down_revision: Union[str, None] = "20260808_0007"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "inventario",
        sa.Column("minimo_stock", sa.Integer(), nullable=False, server_default="0"),
    )
    op.alter_column("inventario", "minimo_stock", server_default=None)
    op.add_column(
        "inventario",
        sa.Column("medida_venta_id", postgresql.UUID(as_uuid=True), nullable=True),
    )
    op.create_foreign_key(
        "fk_inventario_medida_venta", "inventario", "medida", ["medida_venta_id"], ["id"]
    )
    op.create_index("ix_inventario_medida_venta_id", "inventario", ["medida_venta_id"])
    op.create_check_constraint(
        "ck_inventario_minimo_stock_positivo", "inventario", "minimo_stock >= 0"
    )


def downgrade() -> None:
    op.drop_constraint("ck_inventario_minimo_stock_positivo", "inventario", type_="check")
    op.drop_index("ix_inventario_medida_venta_id", table_name="inventario")
    op.drop_constraint("fk_inventario_medida_venta", "inventario", type_="foreignkey")
    op.drop_column("inventario", "medida_venta_id")
    op.drop_column("inventario", "minimo_stock")
