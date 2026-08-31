from __future__ import annotations
import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.metodo_pago import MetodoPago


class MetodoPagoRepository:
    def __init__(self, db: Session):
        self.db = db

    def list(self, skip: int = 0, limit: int = 100) -> list[MetodoPago]:
        stmt = (
            select(MetodoPago)
            .where(MetodoPago.deleted_at.is_(None))
            .order_by(MetodoPago.nombre)
            .offset(skip)
            .limit(limit)
        )
        return list(self.db.scalars(stmt).all())

    def get(self, metodo_pago_id: uuid.UUID) -> MetodoPago | None:
        stmt = select(MetodoPago).where(MetodoPago.id == metodo_pago_id, MetodoPago.deleted_at.is_(None))
        return self.db.scalar(stmt)

    def get_by_nombre(self, nombre: str, exclude_id: uuid.UUID | None = None) -> MetodoPago | None:
        stmt = select(MetodoPago).where(
            MetodoPago.nombre == nombre, MetodoPago.deleted_at.is_(None)
        )
        if exclude_id is not None:
            stmt = stmt.where(MetodoPago.id != exclude_id)
        return self.db.scalar(stmt)

    def add(self, metodo_pago: MetodoPago) -> MetodoPago:
        self.db.add(metodo_pago)
        self.db.commit()
        self.db.refresh(metodo_pago)
        return metodo_pago

    def add_flush(self, metodo_pago: MetodoPago) -> MetodoPago:
        self.db.add(metodo_pago)
        self.db.flush()
        self.db.refresh(metodo_pago)
        return metodo_pago

    def update(self, metodo_pago: MetodoPago) -> MetodoPago:
        self.db.add(metodo_pago)
        self.db.commit()
        self.db.refresh(metodo_pago)
        return metodo_pago

    def soft_delete(self, metodo_pago: MetodoPago) -> None:
        self.db.add(metodo_pago)
        self.db.commit()
