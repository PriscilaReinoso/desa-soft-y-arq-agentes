import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.articulo import Articulo
from app.models.espacio import Espacio
from app.models.inventario import Inventario


def _relaciones_cargadas():
    return (
        selectinload(Inventario.articulo).selectinload(Articulo.categoria),
        selectinload(Inventario.medida),
        selectinload(Inventario.medida_venta),
        selectinload(Inventario.espacio).selectinload(Espacio.deposito),
    )


class InventarioRepository:
    def __init__(self, db: Session):
        self.db = db

    def list(self, skip: int = 0, limit: int = 100) -> list[Inventario]:
        stmt = (
            select(Inventario)
            .options(*_relaciones_cargadas())
            .where(Inventario.deleted_at.is_(None))
            .order_by(Inventario.articulo_id)
            .offset(skip)
            .limit(limit)
        )
        return list(self.db.scalars(stmt).all())

    def list_bajo_minimo(self, skip: int = 0, limit: int = 100) -> list[Inventario]:
        stmt = (
            select(Inventario)
            .options(*_relaciones_cargadas())
            .where(Inventario.deleted_at.is_(None), Inventario.stock < Inventario.minimo_stock)
            .order_by(Inventario.articulo_id)
            .offset(skip)
            .limit(limit)
        )
        return list(self.db.scalars(stmt).all())

    def get(self, inventario_id: uuid.UUID) -> Inventario | None:
        stmt = (
            select(Inventario)
            .options(*_relaciones_cargadas())
            .where(Inventario.id == inventario_id, Inventario.deleted_at.is_(None))
        )
        return self.db.scalar(stmt)

    def get_by_combinacion(self, articulo_id: uuid.UUID, medida_id: uuid.UUID) -> Inventario | None:
        stmt = select(Inventario).where(
            Inventario.articulo_id == articulo_id, Inventario.medida_id == medida_id
        )
        return self.db.scalar(stmt)

    def add(self, inventario: Inventario) -> Inventario:
        self.db.add(inventario)
        self.db.commit()
        self.db.refresh(inventario)
        return inventario

    def add_flush(self, inventario: Inventario) -> Inventario:
        self.db.add(inventario)
        self.db.flush()
        self.db.refresh(inventario)
        return inventario

    def update(self, inventario: Inventario) -> Inventario:
        self.db.add(inventario)
        self.db.commit()
        self.db.refresh(inventario)
        return inventario

    def soft_delete(self, inventario: Inventario) -> None:
        self.db.add(inventario)
        self.db.commit()
