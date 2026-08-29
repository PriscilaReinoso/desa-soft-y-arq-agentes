import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import CheckConstraint, ForeignKey, Numeric, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import Uuid

from app.core.database import Base, utcnow


class ListaPrecios(Base):
    __tablename__ = "lista_precios"
    __table_args__ = (
        UniqueConstraint("proveedor_id", "articulo_id", name="uq_lista_precios_proveedor_articulo"),
        CheckConstraint("precio_lista >= 0", name="ck_lista_precios_precio_positivo"),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    articulo_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("articulo.id"), nullable=False)
    medida_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("medida.id"), nullable=False)
    proveedor_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("proveedor.id"), nullable=False)
    id_articulo_proveedor: Mapped[str | None] = mapped_column(String(100), nullable=True)
    precio_lista: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)

    created_at: Mapped[datetime] = mapped_column(default=utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(default=utcnow, onupdate=utcnow, nullable=False)
    deleted_at: Mapped[datetime | None] = mapped_column(nullable=True)

    articulo: Mapped["Articulo"] = relationship(back_populates="listas_precios")  # type: ignore[name-defined]
    medida: Mapped["Medida"] = relationship(back_populates="listas_precios")  # type: ignore[name-defined]
    proveedor: Mapped["Proveedor"] = relationship(back_populates="listas_precios")  # type: ignore[name-defined]
