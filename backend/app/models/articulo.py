import uuid
from datetime import datetime

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import Uuid

from app.core.database import Base, utcnow


class Articulo(Base):
    __tablename__ = "articulo"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    nombre: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    descripcion: Mapped[str | None] = mapped_column(Text, nullable=True)
    categoria_id: Mapped[uuid.UUID | None] = mapped_column(Uuid, ForeignKey("categoria.id"), nullable=True)

    created_at: Mapped[datetime] = mapped_column(default=utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(default=utcnow, onupdate=utcnow, nullable=False)
    deleted_at: Mapped[datetime | None] = mapped_column(nullable=True)

    categoria: Mapped["Categoria"] = relationship(back_populates="articulos")  # type: ignore[name-defined]
    inventarios: Mapped[list["Inventario"]] = relationship(back_populates="articulo")  # type: ignore[name-defined]
    listas_precios: Mapped[list["ListaPrecios"]] = relationship(back_populates="articulo")  # type: ignore[name-defined]
