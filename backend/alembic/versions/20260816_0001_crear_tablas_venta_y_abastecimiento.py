"""crear tablas de proveedores, listas de precios, presupuestos, metodos de pago y ventas

Revision ID: 20260816_0001
Revises: 20260815_0001
Create Date: 2026-08-16

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "20260816_0001"
down_revision: Union[str, None] = "20260815_0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "proveedor",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("nombre", sa.String(100), nullable=False),
        sa.Column("apellido", sa.String(100), nullable=False),
        sa.Column("telefono", sa.String(30), nullable=False),
        sa.Column("direccion", sa.String(255), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.Column("deleted_at", sa.DateTime(), nullable=True),
    )
    op.create_index("ix_proveedor_nombre", "proveedor", ["nombre"])

    op.create_table(
        "proveedor_categoria",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("proveedor_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("categoria_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.Column("deleted_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["proveedor_id"], ["proveedor.id"]),
        sa.ForeignKeyConstraint(["categoria_id"], ["categoria.id"]),
    )
    op.create_index("ix_proveedor_categoria_categoria_id", "proveedor_categoria", ["categoria_id"])

    op.create_table(
        "lista_precios",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("articulo_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("medida_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("proveedor_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("id_articulo_proveedor", sa.String(100), nullable=True),
        sa.Column("precio_lista", sa.Numeric(12, 2), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.Column("deleted_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["articulo_id"], ["articulo.id"]),
        sa.ForeignKeyConstraint(["medida_id"], ["medida.id"]),
        sa.ForeignKeyConstraint(["proveedor_id"], ["proveedor.id"]),
        sa.UniqueConstraint("proveedor_id", "articulo_id", name="uq_lista_precios_proveedor_articulo"),
        sa.CheckConstraint("precio_lista >= 0", name="ck_lista_precios_precio_positivo"),
    )
    op.create_index("ix_lista_precios_articulo_id", "lista_precios", ["articulo_id"])
    op.create_index("ix_lista_precios_proveedor_id", "lista_precios", ["proveedor_id"])

    op.create_table(
        "metodo_pago",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("nombre", sa.String(50), nullable=False),
        sa.Column("descripcion", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.Column("deleted_at", sa.DateTime(), nullable=True),
        sa.UniqueConstraint("nombre", name="uq_metodo_pago_nombre"),
    )

    op.create_table(
        "presupuesto_cabecera",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("fecha", sa.DateTime(), nullable=False),
        sa.Column("numero", sa.Integer(), nullable=False),
        sa.Column("cantidad", sa.Numeric(12, 2), nullable=False),
        sa.Column("total", sa.Numeric(12, 2), nullable=False),
        sa.Column("cliente", sa.String(100), nullable=True),
        sa.Column("aprobado", sa.Boolean(), nullable=False),
        sa.Column("dias_valido", sa.Numeric(12, 2), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.Column("deleted_at", sa.DateTime(), nullable=True),
        sa.UniqueConstraint("numero", name="uq_presupuesto_cabecera_numero"),
        sa.CheckConstraint("total >= 0", name="ck_presupuesto_cabecera_total_positivo"),
    )
    op.create_index("ix_presupuesto_cabecera_numero", "presupuesto_cabecera", ["numero"])

    op.create_table(
        "presupuesto_detalle",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("presupuesto_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("articulo_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("medida_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("cantidad", sa.Numeric(12, 2), nullable=False),
        sa.Column("precio_venta", sa.Numeric(12, 2), nullable=False),
        sa.Column("sub_total", sa.Numeric(12, 2), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.Column("deleted_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["presupuesto_id"], ["presupuesto_cabecera.id"]),
        sa.ForeignKeyConstraint(["articulo_id"], ["articulo.id"]),
        sa.ForeignKeyConstraint(["medida_id"], ["medida.id"]),
        sa.CheckConstraint("precio_venta >= 0", name="ck_presupuesto_detalle_precio_positivo"),
    )
    op.create_index("ix_presupuesto_detalle_presupuesto_id", "presupuesto_detalle", ["presupuesto_id"])
    op.create_index("ix_presupuesto_detalle_articulo_id", "presupuesto_detalle", ["articulo_id"])

    op.create_table(
        "venta_cabecera",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("fecha", sa.DateTime(), nullable=False),
        sa.Column("numero", sa.Integer(), nullable=False),
        sa.Column("presupuesto_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("cantidad", sa.Numeric(12, 2), nullable=False),
        sa.Column("total", sa.Numeric(12, 2), nullable=False),
        sa.Column("cliente", sa.String(100), nullable=True),
        sa.Column("aprobado", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.Column("deleted_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["presupuesto_id"], ["presupuesto_cabecera.id"]),
        sa.UniqueConstraint("numero", name="uq_venta_cabecera_numero"),
        sa.CheckConstraint("total >= 0", name="ck_venta_cabecera_total_positivo"),
    )
    op.create_index("ix_venta_cabecera_numero", "venta_cabecera", ["numero"])
    op.create_index("ix_venta_cabecera_presupuesto_id", "venta_cabecera", ["presupuesto_id"])

    op.create_table(
        "venta_detalle",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("venta_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("articulo_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("medida_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("cantidad", sa.Numeric(12, 2), nullable=False),
        sa.Column("precio_venta", sa.Numeric(12, 2), nullable=False),
        sa.Column("sub_total", sa.Numeric(12, 2), nullable=False),
        sa.Column("metodo_pago_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.Column("deleted_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["venta_id"], ["venta_cabecera.id"]),
        sa.ForeignKeyConstraint(["articulo_id"], ["articulo.id"]),
        sa.ForeignKeyConstraint(["medida_id"], ["medida.id"]),
        sa.ForeignKeyConstraint(["metodo_pago_id"], ["metodo_pago.id"]),
        sa.CheckConstraint("precio_venta >= 0", name="ck_venta_detalle_precio_positivo"),
    )
    op.create_index("ix_venta_detalle_articulo_id", "venta_detalle", ["articulo_id"])


def downgrade() -> None:
    op.drop_table("venta_detalle")
    op.drop_table("venta_cabecera")
    op.drop_table("presupuesto_detalle")
    op.drop_table("presupuesto_cabecera")
    op.drop_table("metodo_pago")
    op.drop_table("lista_precios")
    op.drop_table("proveedor_categoria")
    op.drop_table("proveedor")
