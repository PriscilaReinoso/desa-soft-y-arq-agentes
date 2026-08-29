import uuid

from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.models.articulo import Articulo
from app.models.presupuesto import PresupuestoCabecera, PresupuestoDetalle


def _relaciones_cargadas():
    return (
        selectinload(PresupuestoCabecera.detalles)
        .selectinload(PresupuestoDetalle.articulo)
        .selectinload(Articulo.categoria),
        selectinload(PresupuestoCabecera.detalles).selectinload(PresupuestoDetalle.medida),
    )


class PresupuestoRepository:
    def __init__(self, db: Session):
        self.db = db

    def list(self, skip: int = 0, limit: int = 100) -> list[PresupuestoCabecera]:
        stmt = (
            select(PresupuestoCabecera)
            .options(*_relaciones_cargadas())
            .where(PresupuestoCabecera.deleted_at.is_(None))
            .order_by(PresupuestoCabecera.numero)
            .offset(skip)
            .limit(limit)
        )
        return list(self.db.scalars(stmt).all())

    def get(self, presupuesto_id: uuid.UUID) -> PresupuestoCabecera | None:
        stmt = (
            select(PresupuestoCabecera)
            .options(*_relaciones_cargadas())
            .where(PresupuestoCabecera.id == presupuesto_id, PresupuestoCabecera.deleted_at.is_(None))
        )
        return self.db.scalar(stmt)

    def get_by_numero(self, numero: int) -> PresupuestoCabecera | None:
        stmt = (
            select(PresupuestoCabecera)
            .options(*_relaciones_cargadas())
            .where(PresupuestoCabecera.numero == numero, PresupuestoCabecera.deleted_at.is_(None))
        )
        return self.db.scalar(stmt)

    def next_numero(self) -> int:
        max_numero = self.db.scalar(select(func.max(PresupuestoCabecera.numero)))
        return (max_numero or 0) + 1

    def add_flush(self, presupuesto: PresupuestoCabecera) -> PresupuestoCabecera:
        self.db.add(presupuesto)
        self.db.flush()
        self.db.refresh(presupuesto)
        return presupuesto

    def update(self, presupuesto: PresupuestoCabecera) -> PresupuestoCabecera:
        self.db.add(presupuesto)
        self.db.commit()
        self.db.refresh(presupuesto)
        return presupuesto

    def commit(self) -> None:
        self.db.commit()

    def soft_delete(self, presupuesto: PresupuestoCabecera) -> None:
        self.db.add(presupuesto)
        self.db.commit()
