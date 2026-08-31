from __future__ import annotations
import uuid

from sqlalchemy.orm import Session

from app.core.database import utcnow
from app.exceptions.base import ConflictError, NotFoundError
from app.models.medida import Medida
from app.repositories.medida_repository import MedidaRepository
from app.schemas.medida import MedidaCreate, MedidaUpdate


class MedidaService:
    def __init__(self, db: Session):
        self.repository = MedidaRepository(db)

    def list(self, skip: int = 0, limit: int = 100) -> list[Medida]:
        return self.repository.list(skip=skip, limit=limit)

    def get(self, medida_id: uuid.UUID) -> Medida:
        medida = self.repository.get(medida_id)
        if medida is None:
            raise NotFoundError(detail="Medida no encontrada")
        return medida

    def create(self, data: MedidaCreate) -> Medida:
        if self.repository.get_by_combinacion(data.unidad_medida, data.medida) is not None:
            raise ConflictError(detail="Ya existe una medida con esa combinación de unidad y medida")
        medida = Medida(unidad_medida=data.unidad_medida, medida=data.medida)
        return self.repository.add(medida)

    def update(self, medida_id: uuid.UUID, data: MedidaUpdate) -> Medida:
        medida = self.get(medida_id)
        unidad = data.unidad_medida if data.unidad_medida is not None else medida.unidad_medida
        valor = data.medida if data.medida is not None else medida.medida
        existing = self.repository.get_by_combinacion(unidad, valor)
        if existing is not None and existing.id != medida.id:
            raise ConflictError(detail="Ya existe una medida con esa combinación de unidad y medida")
        if data.unidad_medida is not None:
            medida.unidad_medida = data.unidad_medida
        if data.medida is not None:
            medida.medida = data.medida
        return self.repository.update(medida)

    def delete(self, medida_id: uuid.UUID) -> None:
        medida = self.get(medida_id)
        medida.deleted_at = utcnow()
        self.repository.soft_delete(medida)
