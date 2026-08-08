import uuid

from fastapi.exceptions import RequestValidationError
from sqlalchemy.orm import Session

from app.core.database import utcnow
from app.exceptions.base import BadRequestError, ConflictError, NotFoundError
from app.models.inventario import Inventario
from app.repositories.articulo_repository import ArticuloRepository
from app.repositories.espacio_repository import EspacioRepository
from app.repositories.inventario_repository import InventarioRepository
from app.repositories.medida_repository import MedidaRepository
from app.schemas.inventario import InventarioCreate, InventarioUpdate


def _validation_error(field: str, msg: str) -> RequestValidationError:
    return RequestValidationError(errors=[{"loc": ("body", field), "msg": msg, "type": "value_error"}])


class InventarioService:
    def __init__(self, db: Session):
        self.repository = InventarioRepository(db)
        self.articulo_repository = ArticuloRepository(db)
        self.medida_repository = MedidaRepository(db)
        self.espacio_repository = EspacioRepository(db)

    def list(self, skip: int = 0, limit: int = 100) -> list[Inventario]:
        return self.repository.list(skip=skip, limit=limit)

    def get(self, inventario_id: uuid.UUID) -> Inventario:
        inventario = self.repository.get(inventario_id)
        if inventario is None:
            raise NotFoundError(detail="Ítem de inventario no encontrado")
        return inventario

    def _validate_referencias(self, articulo_id: uuid.UUID, medida_id: uuid.UUID) -> None:
        if self.articulo_repository.get(articulo_id) is None:
            raise BadRequestError(detail="El artículo no existe o está eliminado")
        if self.medida_repository.get(medida_id) is None:
            raise BadRequestError(detail="La medida no existe o está eliminada")

    def _validate_ubicacion(self, espacio_id, fila, columna, stock) -> None:
        if espacio_id is not None:
            if self.espacio_repository.get(espacio_id) is None:
                raise BadRequestError(detail="El espacio no existe o está eliminado")
            if fila is None or columna is None:
                raise _validation_error("fila", "fila y columna son obligatorias cuando se asigna un espacio")
        if stock > 0 and espacio_id is None:
            raise _validation_error("espacio_id", "espacio_id es obligatorio cuando stock es mayor a 0")

    def create(self, data: InventarioCreate) -> Inventario:
        self._validate_referencias(data.articulo_id, data.medida_id)
        if self.repository.get_by_combinacion(data.articulo_id, data.medida_id) is not None:
            raise ConflictError(detail="Ya existe un ítem de inventario para ese artículo y medida")
        self._validate_ubicacion(data.espacio_id, data.fila, data.columna, data.stock)
        inventario = Inventario(
            articulo_id=data.articulo_id,
            medida_id=data.medida_id,
            espacio_id=data.espacio_id,
            fila=data.fila,
            columna=data.columna,
            stock=data.stock,
            precio_venta=data.precio_venta,
        )
        return self.repository.add(inventario)

    def update(self, inventario_id: uuid.UUID, data: InventarioUpdate) -> Inventario:
        inventario = self.get(inventario_id)
        espacio_id = data.espacio_id if "espacio_id" in data.model_fields_set else inventario.espacio_id
        fila = data.fila if "fila" in data.model_fields_set else inventario.fila
        columna = data.columna if "columna" in data.model_fields_set else inventario.columna
        stock = data.stock if "stock" in data.model_fields_set else inventario.stock
        self._validate_ubicacion(espacio_id, fila, columna, stock)
        if "espacio_id" in data.model_fields_set:
            inventario.espacio_id = data.espacio_id
        if "fila" in data.model_fields_set:
            inventario.fila = data.fila
        if "columna" in data.model_fields_set:
            inventario.columna = data.columna
        if "stock" in data.model_fields_set:
            inventario.stock = data.stock
        if "precio_venta" in data.model_fields_set:
            inventario.precio_venta = data.precio_venta
        return self.repository.update(inventario)

    def delete(self, inventario_id: uuid.UUID) -> None:
        inventario = self.get(inventario_id)
        inventario.deleted_at = utcnow()
        self.repository.soft_delete(inventario)
