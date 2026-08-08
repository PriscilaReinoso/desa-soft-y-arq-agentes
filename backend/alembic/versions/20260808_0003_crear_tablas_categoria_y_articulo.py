"""crear tablas categoria y articulo

Revision ID: 20260808_0003
Revises: 20260806_0002
Create Date: 2026-08-08

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "20260808_0003"
down_revision: Union[str, None] = "20260806_0002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "categoria",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("nombre", sa.String(length=50), nullable=False),
        sa.Column("descripcion", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.Column("deleted_at", sa.DateTime(), nullable=True),
        sa.UniqueConstraint("nombre"),
    )
    op.create_index("ix_categoria_nombre", "categoria", ["nombre"])

    op.create_table(
        "articulo",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("nombre", sa.String(length=100), nullable=False),
        sa.Column("descripcion", sa.Text(), nullable=True),
        sa.Column("categoria_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.Column("deleted_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["categoria_id"], ["categoria.id"]),
        sa.UniqueConstraint("nombre"),
    )
    op.create_index("ix_articulo_nombre", "articulo", ["nombre"])
    op.create_index("ix_articulo_categoria_id", "articulo", ["categoria_id"])


def downgrade() -> None:
    op.drop_table("articulo")
    op.drop_table("categoria")
