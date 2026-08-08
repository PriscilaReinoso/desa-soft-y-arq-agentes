import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.medida import Medida


class MedidaRepository:
    def __init__(self, db: Session):
        self.db = db

    def list(self, skip: int = 0, limit: int = 100) -> list[Medida]:
        stmt = (
            select(Medida)
            .where(Medida.deleted_at.is_(None))
            .order_by(Medida.unidad_medida, Medida.medida)
            .offset(skip)
            .limit(limit)
        )
        return list(self.db.scalars(stmt).all())

    def get(self, medida_id: uuid.UUID) -> Medida | None:
        stmt = select(Medida).where(Medida.id == medida_id, Medida.deleted_at.is_(None))
        return self.db.scalar(stmt)

    def get_by_combinacion(self, unidad_medida: str, medida: str) -> Medida | None:
        stmt = select(Medida).where(
            Medida.unidad_medida == unidad_medida, Medida.medida == medida
        )
        return self.db.scalar(stmt)

    def add(self, medida: Medida) -> Medida:
        self.db.add(medida)
        self.db.commit()
        self.db.refresh(medida)
        return medida

    def add_flush(self, medida: Medida) -> Medida:
        self.db.add(medida)
        self.db.flush()
        self.db.refresh(medida)
        return medida

    def update(self, medida: Medida) -> Medida:
        self.db.add(medida)
        self.db.commit()
        self.db.refresh(medida)
        return medida

    def soft_delete(self, medida: Medida) -> None:
        self.db.add(medida)
        self.db.commit()
