import uuid
from datetime import datetime

from sqlalchemy import Boolean, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import Uuid

from app.core.database import Base, utcnow


class Usuario(Base):
    __tablename__ = "usuario"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    nombre: Mapped[str] = mapped_column(String(100), nullable=False)
    apellido: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(Text, nullable=False)
    role_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("rol.id"), nullable=False)
    activo: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    created_at: Mapped[datetime] = mapped_column(default=utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(default=utcnow, onupdate=utcnow, nullable=False)
    deleted_at: Mapped[datetime | None] = mapped_column(nullable=True)

    rol: Mapped["Rol"] = relationship(back_populates="usuarios")  # type: ignore[name-defined]