from __future__ import annotations
import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.proveedor import Proveedor


class ProveedorRepository:
    def __init__(self, db: Session):
        self.db = db

    def list(self, skip: int = 0, limit: int = 100) -> list[Proveedor]:
        stmt = (
            select(Proveedor)
            .where(Proveedor.deleted_at.is_(None))
            .order_by(Proveedor.nombre, Proveedor.apellido)
            .offset(skip)
            .limit(limit)
        )
        return list(self.db.scalars(stmt).all())

    def get(self, proveedor_id: uuid.UUID) -> Proveedor | None:
        stmt = select(Proveedor).where(Proveedor.id == proveedor_id, Proveedor.deleted_at.is_(None))
        return self.db.scalar(stmt)

    def get_by_telefono(self, telefono: str, exclude_id: uuid.UUID | None = None) -> Proveedor | None:
        stmt = select(Proveedor).where(
            Proveedor.telefono == telefono, Proveedor.deleted_at.is_(None)
        )
        if exclude_id is not None:
            stmt = stmt.where(Proveedor.id != exclude_id)
        return self.db.scalar(stmt)

    def get_by_nombre_apellido(
        self, nombre: str, apellido: str, exclude_id: uuid.UUID | None = None
    ) -> Proveedor | None:
        stmt = select(Proveedor).where(
            Proveedor.nombre == nombre,
            Proveedor.apellido == apellido,
            Proveedor.deleted_at.is_(None),
        )
        if exclude_id is not None:
            stmt = stmt.where(Proveedor.id != exclude_id)
        return self.db.scalar(stmt)

    def add(self, proveedor: Proveedor) -> Proveedor:
        self.db.add(proveedor)
        self.db.commit()
        self.db.refresh(proveedor)
        return proveedor

    def add_flush(self, proveedor: Proveedor) -> Proveedor:
        self.db.add(proveedor)
        self.db.flush()
        self.db.refresh(proveedor)
        return proveedor

    def update(self, proveedor: Proveedor) -> Proveedor:
        self.db.add(proveedor)
        self.db.commit()
        self.db.refresh(proveedor)
        return proveedor

    def soft_delete(self, proveedor: Proveedor) -> None:
        self.db.add(proveedor)
        self.db.commit()
