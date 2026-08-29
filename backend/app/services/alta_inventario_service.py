import uuid

from fastapi.exceptions import RequestValidationError
from sqlalchemy.orm import Session

from app.exceptions.base import BadRequestError, ConflictError, NotFoundError
from app.models.articulo import Articulo
from app.models.espacio import Espacio
from app.models.inventario import Inventario
from app.models.medida import Medida
from app.repositories.articulo_repository import ArticuloRepository
from app.repositories.categoria_repository import CategoriaRepository
from app.repositories.deposito_repository import DepositoRepository
from app.repositories.espacio_repository import EspacioRepository
from app.repositories.inventario_repository import InventarioRepository
from app.repositories.medida_repository import MedidaRepository
from app.schemas.alta_inventario import ArticuloAlta, EspacioAlta, InventarioAlta, MedidaAlta


def _validation_error(field: str, msg: str) -> RequestValidationError:
    return RequestValidationError(errors=[{"loc": ("body", field), "msg": msg, "type": "value_error"}])


class AltaInventarioService:
    def __init__(self, db: Session):
        self.db = db
        self.articulo_repository = ArticuloRepository(db)
        self.medida_repository = MedidaRepository(db)
        self.espacio_repository = EspacioRepository(db)
        self.deposito_repository = DepositoRepository(db)
        self.categoria_repository = CategoriaRepository(db)
        self.inventario_repository = InventarioRepository(db)

    def alta(self, data: InventarioAlta) -> Inventario:
        try:
            inventario = self._alta_en_transaccion(data)
            self.db.commit()
            return inventario
        except Exception:
            self.db.rollback()
            raise

    def _resolve_articulo(self, data: ArticuloAlta) -> Articulo:
        if data.id is not None:
            articulo = self.articulo_repository.get(data.id)
            if articulo is None:
                raise NotFoundError(detail="Artículo no encontrado")
            return articulo
        if self.articulo_repository.get_by_nombre(data.nombre) is not None:
            raise ConflictError(detail="Ya existe un artículo con ese nombre")
        if data.categoria_id is not None and self.categoria_repository.get(data.categoria_id) is None:
            raise BadRequestError(detail="La categoría no existe o está eliminada")
        articulo = Articulo(
            nombre=data.nombre,
            descripcion=data.descripcion,
            categoria_id=data.categoria_id,
        )
        return self.articulo_repository.add_flush(articulo)

    def _resolve_medida(self, data: MedidaAlta) -> Medida:
        if data.id is not None:
            medida = self.medida_repository.get(data.id)
            if medida is None:
                raise NotFoundError(detail="Medida no encontrada")
            return medida
        if self.medida_repository.get_by_combinacion(data.unidad_medida, data.medida) is not None:
            raise ConflictError(detail="Ya existe una medida con esa combinación de unidad y medida")
        medida = Medida(unidad_medida=data.unidad_medida, medida=data.medida)
        return self.medida_repository.add_flush(medida)

    def _resolve_espacio(self, data: EspacioAlta | None) -> Espacio | None:
        if data is None:
            return None
        if data.id is not None:
            espacio = self.espacio_repository.get(data.id)
            if espacio is None:
                raise NotFoundError(detail="Espacio no encontrado")
            return espacio
        deposito = self.deposito_repository.get(data.deposito_id)
        if deposito is None:
            raise BadRequestError(detail="El depósito no existe o está eliminado")
        espacio = Espacio(
            tipo=data.tipo,
            descripcion=data.descripcion,
            deposito_id=data.deposito_id,
            max_fila=data.max_fila,
            max_columna=data.max_columna,
        )
        created = self.espacio_repository.add_flush(espacio)
        deposito.cantidad_espacios += 1
        return created

    def _validate_ubicacion(self, espacio_id: uuid.UUID | None, fila, columna, stock) -> None:
        if espacio_id is not None and (fila is None or columna is None):
            raise _validation_error("fila", "fila y columna son obligatorias cuando se asigna un espacio")
        if stock > 0 and espacio_id is None:
            raise _validation_error("espacio_id", "espacio_id es obligatorio cuando stock es mayor a 0")

    def _alta_en_transaccion(self, data: InventarioAlta) -> Inventario:
        articulo = self._resolve_articulo(data.articulo)
        medida = self._resolve_medida(data.medida)
        espacio = self._resolve_espacio(data.espacio)
        espacio_id = espacio.id if espacio is not None else None
        self._validate_ubicacion(espacio_id, data.fila, data.columna, data.stock)
        if data.medida_venta_id is not None and self.medida_repository.get(data.medida_venta_id) is None:
            raise BadRequestError(detail="La medida de venta no existe o está eliminada")
        if self.inventario_repository.get_by_combinacion(articulo.id, medida.id) is not None:
            raise ConflictError(detail="Ya existe un ítem de inventario para ese artículo y medida")
        inventario = Inventario(
            articulo_id=articulo.id,
            medida_id=medida.id,
            espacio_id=espacio_id,
            fila=data.fila,
            columna=data.columna,
            stock=data.stock,
            minimo_stock=data.minimo_stock,
            precio_venta=data.precio_venta,
            medida_venta_id=data.medida_venta_id,
        )
        return self.inventario_repository.add_flush(inventario)
