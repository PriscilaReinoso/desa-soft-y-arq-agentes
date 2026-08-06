"""crear tablas rol y usuario

Revision ID: 20260805_0001
Revises: 
Create Date: 2026-08-05

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "20260805_0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "rol",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("nombre", sa.String(length=50), nullable=False),
        sa.Column("descripcion", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.Column("deleted_at", sa.DateTime(), nullable=True),
        sa.UniqueConstraint("nombre"),
    )
    op.create_index("ix_rol_nombre", "rol", ["nombre"])

    op.create_table(
        "usuario",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("nombre", sa.String(length=100), nullable=False),
        sa.Column("apellido", sa.String(length=100), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("password_hash", sa.Text(), nullable=False),
        sa.Column("role_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("activo", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.Column("deleted_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["role_id"], ["rol.id"]),
        sa.UniqueConstraint("email"),
    )
    op.create_index("ix_usuario_email", "usuario", ["email"])
    op.create_index("ix_usuario_apellido", "usuario", ["apellido"])


def downgrade() -> None:
    op.drop_table("usuario")
    op.drop_table("rol")