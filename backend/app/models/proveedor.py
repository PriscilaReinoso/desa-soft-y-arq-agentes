import uuid
from datetime import datetime

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import Uuid

from app.core.database import Base, utcnow


class Proveedor(Base):
    __tablename__ = "proveedor"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    nombre: Mapped[str] = mapped_column(String(100), nullable=False)
    apellido: Mapped[str] = mapped_column(String(100), nullable=False)
    telefono: Mapped[str] = mapped_column(String(30), nullable=False)
    direccion: Mapped[str | None] = mapped_column(String(255), nullable=True)

    created_at: Mapped[datetime] = mapped_column(default=utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(default=utcnow, onupdate=utcnow, nullable=False)
    deleted_at: Mapped[datetime | None] = mapped_column(nullable=True)

    categoria_assoc: Mapped[list["ProveedorCategoria"]] = relationship(back_populates="proveedor")  # type: ignore[name-defined]
    listas_precios: Mapped[list["ListaPrecios"]] = relationship(back_populates="proveedor")  # type: ignore[name-defined]

    @property
    def categorias(self) -> list["Categoria"]:  # type: ignore[name-defined]
        return [pc.categoria for pc in self.categoria_assoc if pc.deleted_at is None]
