"""agregar username a usuario

Revision ID: 20260806_0002
Revises: 20260805_0001
Create Date: 2026-08-06

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "20260806_0002"
down_revision: Union[str, None] = "20260805_0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "usuario",
        sa.Column("username", sa.String(length=50), nullable=True),
    )
    op.execute("UPDATE usuario SET username = email")
    op.alter_column(
        "usuario",
        "username",
        existing_type=sa.String(length=50),
        nullable=False,
    )
    op.create_unique_constraint("uq_usuario_username", "usuario", ["username"])
    op.create_index("ix_usuario_username", "usuario", ["username"])


def downgrade() -> None:
    op.drop_index("ix_usuario_username", table_name="usuario")
    op.drop_constraint("uq_usuario_username", "usuario", type_="unique")
    op.drop_column("usuario", "username")
