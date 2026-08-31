from __future__ import annotations
import uuid

from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.models.articulo import Articulo
from app.models.venta import VentaCabecera, VentaDetalle


def _relaciones_cargadas():
    return (
        selectinload(VentaCabecera.detalles)
        .selectinload(VentaDetalle.articulo)
        .selectinload(Articulo.categoria),
        selectinload(VentaCabecera.detalles).selectinload(VentaDetalle.medida),
    )


class VentaRepository:
    def __init__(self, db: Session):
        self.db = db

    def list(self, skip: int = 0, limit: int = 100) -> list[VentaCabecera]:
        stmt = (
            select(VentaCabecera)
            .options(*_relaciones_cargadas())
            .where(VentaCabecera.deleted_at.is_(None))
            .order_by(VentaCabecera.numero)
            .offset(skip)
            .limit(limit)
        )
        return list(self.db.scalars(stmt).all())

    def get(self, venta_id: uuid.UUID) -> VentaCabecera | None:
        stmt = (
            select(VentaCabecera)
            .options(*_relaciones_cargadas())
            .where(VentaCabecera.id == venta_id, VentaCabecera.deleted_at.is_(None))
        )
        return self.db.scalar(stmt)

    def get_by_numero(self, numero: int) -> VentaCabecera | None:
        stmt = (
            select(VentaCabecera)
            .options(*_relaciones_cargadas())
            .where(VentaCabecera.numero == numero, VentaCabecera.deleted_at.is_(None))
        )
        return self.db.scalar(stmt)

    def next_numero(self) -> int:
        max_numero = self.db.scalar(select(func.max(VentaCabecera.numero)))
        return (max_numero or 0) + 1

    def add_flush(self, venta: VentaCabecera) -> VentaCabecera:
        self.db.add(venta)
        self.db.flush()
        self.db.refresh(venta)
        return venta

    def update(self, venta: VentaCabecera) -> VentaCabecera:
        self.db.add(venta)
        self.db.commit()
        self.db.refresh(venta)
        return venta

    def commit(self) -> None:
        self.db.commit()

    def soft_delete(self, venta: VentaCabecera) -> None:
        self.db.add(venta)
        self.db.commit()
