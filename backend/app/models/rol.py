import uuid
from datetime import datetime

from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import Uuid

from app.core.database import Base, utcnow


class Rol(Base):
    __tablename__ = "rol"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    nombre: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    descripcion: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(default=utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(default=utcnow, onupdate=utcnow, nullable=False)
    deleted_at: Mapped[datetime | None] = mapped_column(nullable=True)

    usuarios: Mapped[list["Usuario"]] = relationship(back_populates="rol")  # type: ignore[name-defined]