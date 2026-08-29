import uuid

from sqlalchemy.orm import Session

from app.core.database import utcnow
from app.exceptions.base import ConflictError, NotFoundError
from app.models.metodo_pago import MetodoPago
from app.repositories.metodo_pago_repository import MetodoPagoRepository
from app.schemas.metodo_pago import MetodoPagoCreate, MetodoPagoUpdate


class MetodoPagoService:
    def __init__(self, db: Session):
        self.repository = MetodoPagoRepository(db)

    def list(self, skip: int = 0, limit: int = 100) -> list[MetodoPago]:
        return self.repository.list(skip=skip, limit=limit)

    def get(self, metodo_pago_id: uuid.UUID) -> MetodoPago:
        metodo_pago = self.repository.get(metodo_pago_id)
        if metodo_pago is None:
            raise NotFoundError(detail="Método de pago no encontrado")
        return metodo_pago

    def create(self, data: MetodoPagoCreate) -> MetodoPago:
        if self.repository.get_by_nombre(data.nombre) is not None:
            raise ConflictError(detail="Ya existe un método de pago con ese nombre")
        metodo_pago = MetodoPago(nombre=data.nombre, descripcion=data.descripcion)
        return self.repository.add(metodo_pago)

    def update(self, metodo_pago_id: uuid.UUID, data: MetodoPagoUpdate) -> MetodoPago:
        metodo_pago = self.get(metodo_pago_id)
        if "nombre" in data.model_fields_set:
            if data.nombre is None:
                raise ConflictError(detail="El nombre es obligatorio")
            if self.repository.get_by_nombre(data.nombre, exclude_id=metodo_pago_id) is not None:
                raise ConflictError(detail="Ya existe un método de pago con ese nombre")
            metodo_pago.nombre = data.nombre
        if "descripcion" in data.model_fields_set:
            metodo_pago.descripcion = data.descripcion
        return self.repository.update(metodo_pago)

    def delete(self, metodo_pago_id: uuid.UUID) -> None:
        metodo_pago = self.get(metodo_pago_id)
        metodo_pago.deleted_at = utcnow()
        self.repository.soft_delete(metodo_pago)
