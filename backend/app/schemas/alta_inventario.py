import uuid
from decimal import Decimal

from pydantic import BaseModel, Field, model_validator


class ArticuloAlta(BaseModel):
    id: uuid.UUID | None = None
    nombre: str | None = Field(default=None, min_length=1, max_length=100)
    descripcion: str | None = None
    categoria_id: uuid.UUID | None = None

    @model_validator(mode="after")
    def validar_articulo_nuevo(self):
        if self.id is None and (self.nombre is None or self.categoria_id is None):
            raise ValueError("Para un artículo nuevo se requieren nombre y categoria_id")
        return self


class MedidaAlta(BaseModel):
    id: uuid.UUID | None = None
    unidad_medida: str | None = Field(default=None, min_length=1, max_length=30)
    medida: str | None = Field(default=None, min_length=1, max_length=30)

    @model_validator(mode="after")
    def validar_medida_nueva(self):
        if self.id is None and (self.unidad_medida is None or self.medida is None):
            raise ValueError("Para una medida nueva se requieren unidad_medida y medida")
        return self


class EspacioAlta(BaseModel):
    id: uuid.UUID | None = None
    deposito_id: uuid.UUID | None = None
    tipo: str | None = Field(default=None, max_length=50)
    descripcion: str | None = None
    max_fila: int | None = Field(default=None, ge=0)
    max_columna: int | None = Field(default=None, ge=0)

    @model_validator(mode="after")
    def validar_espacio_nuevo(self):
        if self.id is None and self.deposito_id is None:
            raise ValueError("Para un espacio nuevo se requiere deposito_id")
        return self


class InventarioAlta(BaseModel):
    articulo: ArticuloAlta
    medida: MedidaAlta
    espacio: EspacioAlta | None = None
    fila: int | None = Field(default=None, ge=0)
    columna: int | None = Field(default=None, ge=0)
    stock: int = Field(default=0, ge=0)
    minimo_stock: int = Field(default=0, ge=0)
    precio_venta: Decimal = Field(ge=0, decimal_places=2)
    medida_venta_id: uuid.UUID | None = None
