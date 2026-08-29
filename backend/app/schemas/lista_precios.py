import uuid
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.schemas.alta_inventario import ArticuloAlta, MedidaAlta
from app.schemas.articulo import ArticuloOut
from app.schemas.categoria import CategoriaOut
from app.schemas.medida import MedidaOut
from app.schemas.proveedor import ProveedorOut


class ProveedorAlta(BaseModel):
    id: uuid.UUID | None = None
    nombre: str | None = Field(default=None, min_length=1, max_length=100)
    apellido: str | None = Field(default=None, min_length=1, max_length=100)
    telefono: str | None = Field(default=None, min_length=1, max_length=30)
    direccion: str | None = Field(default=None, max_length=255)
    categoria_ids: list[uuid.UUID] = []

    @model_validator(mode="after")
    def validar_proveedor_nuevo(self):
        if self.id is None and (self.nombre is None or self.apellido is None or self.telefono is None):
            raise ValueError("Para un proveedor nuevo se requieren nombre, apellido y telefono")
        return self


class ItemListaPrecio(BaseModel):
    articulo: ArticuloAlta
    medida: MedidaAlta
    id_articulo_proveedor: str | None = Field(default=None, max_length=100)
    precio_lista: Decimal = Field(ge=0, decimal_places=2)


class ListaPreciosAlta(BaseModel):
    proveedor_id: uuid.UUID | None = None
    proveedor: ProveedorAlta | None = None
    items: list[ItemListaPrecio] = Field(min_length=1)

    @model_validator(mode="after")
    def validar_proveedor(self):
        if (self.proveedor_id is None) == (self.proveedor is None):
            raise ValueError("Debe enviarse exactamente uno de proveedor_id o proveedor")
        return self


class MapeoColumna(BaseModel):
    key: str = Field(min_length=1)
    value: str = Field(min_length=1)


class ListaPreciosExcelAlta(BaseModel):
    proveedor_id: uuid.UUID | None = None
    proveedor: ProveedorAlta | None = None
    mapeo: list[MapeoColumna] = Field(min_length=1)

    @model_validator(mode="after")
    def validar_proveedor(self):
        if (self.proveedor_id is None) == (self.proveedor is None):
            raise ValueError("Debe enviarse exactamente uno de proveedor_id o proveedor")
        return self


class LineaDescartada(BaseModel):
    fila: int
    motivo: str


class ListaPreciosExcelRespuesta(BaseModel):
    registros: list[ListaPreciosOut]
    lineas_descartadas: list[LineaDescartada]


class ListaPreciosUpdate(BaseModel):
    precio_lista: Decimal = Field(ge=0, decimal_places=2)
    id_articulo_proveedor: str | None = Field(default=None, max_length=100)


class CantidadListaPorProveedor(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    proveedor: ProveedorOut
    cantidad: int
    por_categoria: list["CantidadListaPorCategoria"]


class CantidadListaPorCategoria(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    categoria: CategoriaOut
    cantidad: int


CantidadListaPorProveedor.model_rebuild()


class ListaPreciosOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    articulo: ArticuloOut
    medida: MedidaOut
    proveedor: ProveedorOut
    id_articulo_proveedor: str | None
    precio_lista: Decimal
