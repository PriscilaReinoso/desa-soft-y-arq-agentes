import uuid
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.articulo import ArticuloOut
from app.schemas.categoria import CategoriaOut
from app.schemas.deposito import DepositoOut
from app.schemas.espacio import EspacioOut
from app.schemas.medida import MedidaOut


class InventarioCreate(BaseModel):
    articulo_id: uuid.UUID
    medida_id: uuid.UUID
    espacio_id: uuid.UUID | None = None
    fila: int | None = Field(default=None, ge=0)
    columna: int | None = Field(default=None, ge=0)
    stock: int = Field(default=0, ge=0)
    minimo_stock: int = Field(default=0, ge=0)
    precio_venta: Decimal = Field(ge=0, decimal_places=2)
    medida_venta_id: uuid.UUID | None = None


class InventarioUpdate(BaseModel):
    medida_id: uuid.UUID | None = None
    espacio_id: uuid.UUID | None = None
    fila: int | None = Field(default=None, ge=0)
    columna: int | None = Field(default=None, ge=0)
    stock: int | None = Field(default=None, ge=0)
    minimo_stock: int | None = Field(default=None, ge=0)
    precio_venta: Decimal | None = Field(default=None, ge=0, decimal_places=2)
    medida_venta_id: uuid.UUID | None = None


class ArticuloConCategoria(ArticuloOut):
    categoria: CategoriaOut


class EspacioConDeposito(EspacioOut):
    deposito: DepositoOut


class InventarioOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    fila: int | None = None
    columna: int | None = None
    stock: int
    minimo_stock: int
    precio_venta: Decimal
    articulo: ArticuloConCategoria
    medida: MedidaOut
    medida_venta: MedidaOut | None = None
    espacio: EspacioConDeposito | None = None
