import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.articulo import Articulo


class ArticuloRepository:
    def __init__(self, db: Session):
        self.db = db

    def list(self, skip: int = 0, limit: int = 100) -> list[Articulo]:
        stmt = (
            select(Articulo)
            .where(Articulo.deleted_at.is_(None))
            .order_by(Articulo.nombre)
            .offset(skip)
            .limit(limit)
        )
        return list(self.db.scalars(stmt).all())

    def get(self, articulo_id: uuid.UUID) -> Articulo | None:
        stmt = select(Articulo).where(Articulo.id == articulo_id, Articulo.deleted_at.is_(None))
        return self.db.scalar(stmt)

    def get_by_nombre(self, nombre: str) -> Articulo | None:
        stmt = select(Articulo).where(Articulo.nombre == nombre)
        return self.db.scalar(stmt)

    def add(self, articulo: Articulo) -> Articulo:
        self.db.add(articulo)
        self.db.commit()
        self.db.refresh(articulo)
        return articulo

    def add_flush(self, articulo: Articulo) -> Articulo:
        self.db.add(articulo)
        self.db.flush()
        self.db.refresh(articulo)
        return articulo

    def update(self, articulo: Articulo) -> Articulo:
        self.db.add(articulo)
        self.db.commit()
        self.db.refresh(articulo)
        return articulo

    def soft_delete(self, articulo: Articulo) -> None:
        self.db.add(articulo)
        self.db.commit()
