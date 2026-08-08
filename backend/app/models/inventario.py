import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import CheckConstraint, ForeignKey, Integer, Numeric, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import Uuid

from app.core.database import Base, utcnow


class Inventario(Base):
    __tablename__ = "inventario"
    __table_args__ = (
        UniqueConstraint("articulo_id", "medida_id", name="uq_inventario_articulo_medida"),
        CheckConstraint("stock >= 0", name="ck_inventario_stock_positivo"),
        CheckConstraint("precio_venta >= 0", name="ck_inventario_precio_positivo"),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    articulo_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("articulo.id"), nullable=False)
    medida_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("medida.id"), nullable=False)
    espacio_id: Mapped[uuid.UUID | None] = mapped_column(Uuid, ForeignKey("espacio.id"), nullable=True)
    fila: Mapped[int | None] = mapped_column(Integer, nullable=True)
    columna: Mapped[int | None] = mapped_column(Integer, nullable=True)
    stock: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    precio_venta: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)

    created_at: Mapped[datetime] = mapped_column(default=utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(default=utcnow, onupdate=utcnow, nullable=False)
    deleted_at: Mapped[datetime | None] = mapped_column(nullable=True)

    articulo: Mapped["Articulo"] = relationship(back_populates="inventarios")  # type: ignore[name-defined]
    medida: Mapped["Medida"] = relationship(back_populates="inventarios")  # type: ignore[name-defined]
    espacio: Mapped["Espacio"] = relationship(back_populates="inventarios")  # type: ignore[name-defined]
