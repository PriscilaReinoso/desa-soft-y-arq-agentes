import uuid
from datetime import datetime

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import Uuid

from app.core.database import Base, utcnow


class ProveedorCategoria(Base):
    __tablename__ = "proveedor_categoria"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    proveedor_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("proveedor.id"), nullable=False)
    categoria_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("categoria.id"), nullable=False)

    created_at: Mapped[datetime] = mapped_column(default=utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(default=utcnow, onupdate=utcnow, nullable=False)
    deleted_at: Mapped[datetime | None] = mapped_column(nullable=True)

    proveedor: Mapped["Proveedor"] = relationship(back_populates="categoria_assoc")  # type: ignore[name-defined]
    categoria: Mapped["Categoria"] = relationship(back_populates="proveedor_assoc")  # type: ignore[name-defined]
