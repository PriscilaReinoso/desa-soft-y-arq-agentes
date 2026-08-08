import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.categoria import Categoria


class CategoriaRepository:
    def __init__(self, db: Session):
        self.db = db

    def list(self, skip: int = 0, limit: int = 100) -> list[Categoria]:
        stmt = (
            select(Categoria)
            .where(Categoria.deleted_at.is_(None))
            .order_by(Categoria.nombre)
            .offset(skip)
            .limit(limit)
        )
        return list(self.db.scalars(stmt).all())

    def get(self, categoria_id: uuid.UUID) -> Categoria | None:
        stmt = select(Categoria).where(Categoria.id == categoria_id, Categoria.deleted_at.is_(None))
        return self.db.scalar(stmt)

    def get_by_nombre(self, nombre: str) -> Categoria | None:
        stmt = select(Categoria).where(Categoria.nombre == nombre)
        return self.db.scalar(stmt)

    def add(self, categoria: Categoria) -> Categoria:
        self.db.add(categoria)
        self.db.commit()
        self.db.refresh(categoria)
        return categoria

    def update(self, categoria: Categoria) -> Categoria:
        self.db.add(categoria)
        self.db.commit()
        self.db.refresh(categoria)
        return categoria

    def soft_delete(self, categoria: Categoria) -> None:
        self.db.add(categoria)
        self.db.commit()
