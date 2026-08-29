import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import Boolean, CheckConstraint, ForeignKey, Integer, Numeric, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import Uuid

from app.core.database import Base, utcnow


class PresupuestoCabecera(Base):
    __tablename__ = "presupuesto_cabecera"
    __table_args__ = (
        UniqueConstraint("numero", name="uq_presupuesto_cabecera_numero"),
        CheckConstraint("total >= 0", name="ck_presupuesto_cabecera_total_positivo"),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    fecha: Mapped[datetime] = mapped_column(default=utcnow, nullable=False)
    numero: Mapped[int] = mapped_column(Integer, nullable=False)
    cantidad: Mapped[int] = mapped_column(Integer, nullable=False)
    total: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    cliente: Mapped[str | None] = mapped_column(String(100), nullable=True)
    aprobado: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    dias_valido: Mapped[Decimal | None] = mapped_column(Numeric(12, 2), nullable=True)

    created_at: Mapped[datetime] = mapped_column(default=utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(default=utcnow, onupdate=utcnow, nullable=False)
    deleted_at: Mapped[datetime | None] = mapped_column(nullable=True)

    detalles: Mapped[list["PresupuestoDetalle"]] = relationship(
        back_populates="presupuesto", cascade="all, delete-orphan"
    )  # type: ignore[name-defined]


class PresupuestoDetalle(Base):
    __tablename__ = "presupuesto_detalle"
    __table_args__ = (CheckConstraint("precio_venta >= 0", name="ck_presupuesto_detalle_precio_positivo"),)

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    presupuesto_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("presupuesto_cabecera.id"), nullable=False)
    articulo_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("articulo.id"), nullable=False)
    medida_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("medida.id"), nullable=False)
    cantidad: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    precio_venta: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    sub_total: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)

    created_at: Mapped[datetime] = mapped_column(default=utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(default=utcnow, onupdate=utcnow, nullable=False)
    deleted_at: Mapped[datetime | None] = mapped_column(nullable=True)

    presupuesto: Mapped["PresupuestoCabecera"] = relationship(back_populates="detalles")  # type: ignore[name-defined]
    articulo: Mapped["Articulo"] = relationship()  # type: ignore[name-defined]
    medida: Mapped["Medida"] = relationship()  # type: ignore[name-defined]
