from __future__ import annotations
import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.rol import Rol


class RolRepository:
    def __init__(self, db: Session):
        self.db = db

    def list(self, skip: int = 0, limit: int = 100) -> list[Rol]:
        stmt = (
            select(Rol)
            .where(Rol.deleted_at.is_(None))
            .order_by(Rol.nombre)
            .offset(skip)
            .limit(limit)
        )
        return list(self.db.scalars(stmt).all())

    def get(self, rol_id: uuid.UUID) -> Rol | None:
        stmt = select(Rol).where(Rol.id == rol_id, Rol.deleted_at.is_(None))
        return self.db.scalar(stmt)

    def get_by_nombre(self, nombre: str) -> Rol | None:
        stmt = select(Rol).where(Rol.nombre == nombre)
        return self.db.scalar(stmt)

    def add(self, rol: Rol) -> Rol:
        self.db.add(rol)
        self.db.commit()
        self.db.refresh(rol)
        return rol

    def update(self, rol: Rol) -> Rol:
        self.db.add(rol)
        self.db.commit()
        self.db.refresh(rol)
        return rol

    def soft_delete(self, rol: Rol) -> None:
        self.db.add(rol)
        self.db.commit()
