import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.deposito import Deposito


class DepositoRepository:
    def __init__(self, db: Session):
        self.db = db

    def list(self, skip: int = 0, limit: int = 100) -> list[Deposito]:
        stmt = (
            select(Deposito)
            .where(Deposito.deleted_at.is_(None))
            .order_by(Deposito.nombre)
            .offset(skip)
            .limit(limit)
        )
        return list(self.db.scalars(stmt).all())

    def get(self, deposito_id: uuid.UUID) -> Deposito | None:
        stmt = select(Deposito).where(Deposito.id == deposito_id, Deposito.deleted_at.is_(None))
        return self.db.scalar(stmt)

    def add(self, deposito: Deposito) -> Deposito:
        self.db.add(deposito)
        self.db.commit()
        self.db.refresh(deposito)
        return deposito

    def update(self, deposito: Deposito) -> Deposito:
        self.db.add(deposito)
        self.db.commit()
        self.db.refresh(deposito)
        return deposito

    def soft_delete(self, deposito: Deposito) -> None:
        self.db.add(deposito)
        self.db.commit()
