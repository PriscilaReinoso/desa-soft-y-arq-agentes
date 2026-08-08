import uuid

from sqlalchemy.orm import Session

from app.core.database import utcnow
from app.exceptions.base import NotFoundError
from app.models.deposito import Deposito
from app.repositories.deposito_repository import DepositoRepository
from app.schemas.deposito import DepositoCreate, DepositoUpdate


class DepositoService:
    def __init__(self, db: Session):
        self.repository = DepositoRepository(db)

    def list(self, skip: int = 0, limit: int = 100) -> list[Deposito]:
        return self.repository.list(skip=skip, limit=limit)

    def get(self, deposito_id: uuid.UUID) -> Deposito:
        deposito = self.repository.get(deposito_id)
        if deposito is None:
            raise NotFoundError(detail="Depósito no encontrado")
        return deposito

    def create(self, data: DepositoCreate) -> Deposito:
        deposito = Deposito(
            nombre=data.nombre,
            descripcion=data.descripcion,
            direccion=data.direccion,
            cantidad_espacios=0,
        )
        return self.repository.add(deposito)

    def update(self, deposito_id: uuid.UUID, data: DepositoUpdate) -> Deposito:
        deposito = self.get(deposito_id)
        if data.nombre is not None:
            deposito.nombre = data.nombre
        if data.descripcion is not None:
            deposito.descripcion = data.descripcion
        if data.direccion is not None:
            deposito.direccion = data.direccion
        return self.repository.update(deposito)

    def delete(self, deposito_id: uuid.UUID) -> None:
        deposito = self.get(deposito_id)
        deposito.deleted_at = utcnow()
        self.repository.soft_delete(deposito)
