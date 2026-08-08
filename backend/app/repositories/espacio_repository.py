import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.espacio import Espacio


class EspacioRepository:
    def __init__(self, db: Session):
        self.db = db

    def list(self, skip: int = 0, limit: int = 100) -> list[Espacio]:
        stmt = (
            select(Espacio)
            .where(Espacio.deleted_at.is_(None))
            .order_by(Espacio.tipo, Espacio.id)
            .offset(skip)
            .limit(limit)
        )
        return list(self.db.scalars(stmt).all())

    def get(self, espacio_id: uuid.UUID) -> Espacio | None:
        stmt = select(Espacio).where(Espacio.id == espacio_id, Espacio.deleted_at.is_(None))
        return self.db.scalar(stmt)

    def add(self, espacio: Espacio) -> Espacio:
        self.db.add(espacio)
        self.db.commit()
        self.db.refresh(espacio)
        return espacio

    def add_flush(self, espacio: Espacio) -> Espacio:
        self.db.add(espacio)
        self.db.flush()
        self.db.refresh(espacio)
        return espacio

    def update(self, espacio: Espacio) -> Espacio:
        self.db.add(espacio)
        self.db.commit()
        self.db.refresh(espacio)
        return espacio

    def soft_delete(self, espacio: Espacio) -> None:
        self.db.add(espacio)
        self.db.commit()
