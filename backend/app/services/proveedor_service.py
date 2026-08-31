from __future__ import annotations
import uuid

from fastapi.exceptions import RequestValidationError
from sqlalchemy.orm import Session

from app.core.database import utcnow
from app.exceptions.base import BadRequestError, ConflictError, NotFoundError
from app.models.proveedor import Proveedor
from app.models.proveedor_categoria import ProveedorCategoria
from app.repositories.categoria_repository import CategoriaRepository
from app.repositories.proveedor_categoria_repository import ProveedorCategoriaRepository
from app.repositories.proveedor_repository import ProveedorRepository
from app.schemas.proveedor import ProveedorCreate, ProveedorUpdate


def _validation_error(field: str, msg: str) -> RequestValidationError:
    return RequestValidationError(errors=[{"loc": ("body", field), "msg": msg, "type": "value_error"}])


class ProveedorService:
    def __init__(self, db: Session):
        self.db = db
        self.repository = ProveedorRepository(db)
        self.categoria_repository = CategoriaRepository(db)
        self.proveedor_categoria_repository = ProveedorCategoriaRepository(db)

    def list(self, skip: int = 0, limit: int = 100) -> list[Proveedor]:
        return self.repository.list(skip=skip, limit=limit)

    def get(self, proveedor_id: uuid.UUID) -> Proveedor:
        proveedor = self.repository.get(proveedor_id)
        if proveedor is None:
            raise NotFoundError(detail="Proveedor no encontrado")
        return proveedor

    def _validate_unicidad(self, data: ProveedorCreate | ProveedorUpdate, exclude_id: uuid.UUID | None = None) -> None:
        telefono = data.telefono if "telefono" in data.model_fields_set else None
        nombre = data.nombre if "nombre" in data.model_fields_set else None
        apellido = data.apellido if "apellido" in data.model_fields_set else None
        if telefono is not None and self.repository.get_by_telefono(telefono, exclude_id=exclude_id) is not None:
            raise ConflictError(detail="Ya existe un proveedor con ese teléfono")
        if (
            nombre is not None
            and apellido is not None
            and self.repository.get_by_nombre_apellido(nombre, apellido, exclude_id=exclude_id) is not None
        ):
            raise ConflictError(detail="Ya existe un proveedor con ese nombre y apellido")

    def _validate_categorias(self, categoria_ids: list[uuid.UUID]) -> None:
        for categoria_id in categoria_ids:
            if self.categoria_repository.get(categoria_id) is None:
                raise BadRequestError(detail="La categoría no existe o está eliminada")

    def create(self, data: ProveedorCreate) -> Proveedor:
        self._validate_unicidad(data)
        self._validate_categorias(data.categoria_ids)
        proveedor = Proveedor(
            nombre=data.nombre,
            apellido=data.apellido,
            telefono=data.telefono,
            direccion=data.direccion,
        )
        self.db.add(proveedor)
        self.db.flush()
        for categoria_id in data.categoria_ids:
            self.proveedor_categoria_repository.add_flush(
                ProveedorCategoria(proveedor_id=proveedor.id, categoria_id=categoria_id)
            )
        self.db.commit()
        self.db.refresh(proveedor)
        return proveedor

    def update(self, proveedor_id: uuid.UUID, data: ProveedorUpdate) -> Proveedor:
        proveedor = self.get(proveedor_id)
        self._validate_unicidad(data, exclude_id=proveedor_id)
        if "nombre" in data.model_fields_set:
            proveedor.nombre = data.nombre
        if "apellido" in data.model_fields_set:
            proveedor.apellido = data.apellido
        if "telefono" in data.model_fields_set:
            proveedor.telefono = data.telefono
        if "direccion" in data.model_fields_set:
            proveedor.direccion = data.direccion
        if "categoria_ids" in data.model_fields_set:
            self._validate_categorias(data.categoria_ids)
            self._sync_categorias(proveedor.id, data.categoria_ids)
        return self.repository.update(proveedor)

    def _sync_categorias(self, proveedor_id: uuid.UUID, categoria_ids: list[uuid.UUID]) -> None:
        actuales = {
            pc.categoria_id: pc for pc in self.proveedor_categoria_repository.list_by_proveedor(proveedor_id)
        }
        deseadas = set(categoria_ids)
        for categoria_id in actuales:
            if categoria_id not in deseadas:
                actuales[categoria_id].deleted_at = utcnow()
        for categoria_id in deseadas - set(actuales):
            self.proveedor_categoria_repository.add_flush(
                ProveedorCategoria(proveedor_id=proveedor_id, categoria_id=categoria_id)
            )

    def delete(self, proveedor_id: uuid.UUID) -> None:
        proveedor = self.get(proveedor_id)
        proveedor.deleted_at = utcnow()
        self.repository.soft_delete(proveedor)
