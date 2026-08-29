"""cantidad entera en presupuestos

Revision ID: 20260820_0002
Revises: 20260820_0001
Create Date: 2026-08-20

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "20260820_0002"
down_revision: Union[str, None] = "20260820_0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column(
        "presupuesto_cabecera",
        "cantidad",
        existing_type=sa.Numeric(12, 2),
        type_=sa.Integer(),
        existing_nullable=False,
        postgresql_using="ROUND(cantidad)::integer",
    )
    op.alter_column(
        "presupuesto_detalle",
        "cantidad",
        existing_type=sa.Numeric(12, 2),
        type_=sa.Integer(),
        existing_nullable=False,
        postgresql_using="ROUND(cantidad)::integer",
    )


def downgrade() -> None:
    op.alter_column(
        "presupuesto_detalle",
        "cantidad",
        existing_type=sa.Integer(),
        type_=sa.Numeric(12, 2),
        existing_nullable=False,
        postgresql_using="cantidad::numeric",
    )
    op.alter_column(
        "presupuesto_cabecera",
        "cantidad",
        existing_type=sa.Integer(),
        type_=sa.Numeric(12, 2),
        existing_nullable=False,
        postgresql_using="cantidad::numeric",
    )
