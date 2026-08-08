import uuid
from datetime import datetime

from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import Uuid

from app.core.database import Base, utcnow


class Espacio(Base):
    __tablename__ = "espacio"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    tipo: Mapped[str | None] = mapped_column(String(50), nullable=True)
    descripcion: Mapped[str | None] = mapped_column(Text, nullable=True)
    deposito_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("deposito.id"), nullable=False)
    max_fila: Mapped[int | None] = mapped_column(Integer, nullable=True)
    max_columna: Mapped[int | None] = mapped_column(Integer, nullable=True)

    created_at: Mapped[datetime] = mapped_column(default=utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(default=utcnow, onupdate=utcnow, nullable=False)
    deleted_at: Mapped[datetime | None] = mapped_column(nullable=True)

    deposito: Mapped["Deposito"] = relationship(back_populates="espacios")  # type: ignore[name-defined]
    inventarios: Mapped[list["Inventario"]] = relationship(back_populates="espacio")  # type: ignore[name-defined]
