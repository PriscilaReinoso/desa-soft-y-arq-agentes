import uuid
from datetime import datetime

from sqlalchemy import String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import Uuid

from app.core.database import Base, utcnow


class Medida(Base):
    __tablename__ = "medida"
    __table_args__ = (UniqueConstraint("unidad_medida", "medida", name="uq_medida_unidad_medida"),)

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    unidad_medida: Mapped[str] = mapped_column(String(30), nullable=False)
    medida: Mapped[str] = mapped_column(String(30), nullable=False)

    created_at: Mapped[datetime] = mapped_column(default=utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(default=utcnow, onupdate=utcnow, nullable=False)
    deleted_at: Mapped[datetime | None] = mapped_column(nullable=True)

    inventarios: Mapped[list["Inventario"]] = relationship(foreign_keys="Inventario.medida_id", back_populates="medida")  # type: ignore[name-defined]
    inventarios_venta: Mapped[list["Inventario"]] = relationship(foreign_keys="Inventario.medida_venta_id", back_populates="medida_venta")  # type: ignore[name-defined]
