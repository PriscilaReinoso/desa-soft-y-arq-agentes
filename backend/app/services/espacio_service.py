import uuid

from sqlalchemy.orm import Session

from app.core.database import utcnow
from app.exceptions.base import BadRequestError, NotFoundError
from app.models.espacio import Espacio
from app.repositories.deposito_repository import DepositoRepository
from app.repositories.espacio_repository import EspacioRepository
from app.schemas.espacio import EspacioCreate, EspacioUpdate


class EspacioService:
    def __init__(self, db: Session):
        self.repository = EspacioRepository(db)
        self.deposito_repository = DepositoRepository(db)

    def list(self, skip: int = 0, limit: int = 100) -> list[Espacio]:
        return self.repository.list(skip=skip, limit=limit)

    def get(self, espacio_id: uuid.UUID) -> Espacio:
        espacio = self.repository.get(espacio_id)
        if espacio is None:
            raise NotFoundError(detail="Espacio no encontrado")
        return espacio

    def _validate_deposito(self, deposito_id: uuid.UUID) -> None:
        if self.deposito_repository.get(deposito_id) is None:
            raise BadRequestError(detail="El depósito no existe o está eliminado")

    def create(self, data: EspacioCreate) -> Espacio:
        self._validate_deposito(data.deposito_id)
        deposito = self.deposito_repository.get(data.deposito_id)
        espacio = Espacio(
            tipo=data.tipo,
            descripcion=data.descripcion,
            deposito_id=data.deposito_id,
            max_fila=data.max_fila,
            max_columna=data.max_columna,
        )
        created = self.repository.add(espacio)
        deposito.cantidad_espacios += 1
        self.deposito_repository.update(deposito)
        return created

    def update(self, espacio_id: uuid.UUID, data: EspacioUpdate) -> Espacio:
        espacio = self.get(espacio_id)
        if data.deposito_id is not None:
            self._validate_deposito(data.deposito_id)
            espacio.deposito_id = data.deposito_id
        if data.tipo is not None:
            espacio.tipo = data.tipo
        if data.descripcion is not None:
            espacio.descripcion = data.descripcion
        if data.max_fila is not None:
            espacio.max_fila = data.max_fila
        if data.max_columna is not None:
            espacio.max_columna = data.max_columna
        return self.repository.update(espacio)

    def delete(self, espacio_id: uuid.UUID) -> None:
        espacio = self.get(espacio_id)
        deposito = self.deposito_repository.get(espacio.deposito_id)
        espacio.deleted_at = utcnow()
        self.repository.soft_delete(espacio)
        if deposito is not None and deposito.cantidad_espacios > 0:
            deposito.cantidad_espacios -= 1
            self.deposito_repository.update(deposito)
