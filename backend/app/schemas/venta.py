import uuid
from datetime import datetime
from decimal import Decimal
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.articulo import ArticuloOut
from app.schemas.medida import MedidaOut


class PeriodoVentas(str, Enum):
    dia = "dia"
    semana = "semana"
    mes = "mes"
    anio = "año"


class ItemVenta(BaseModel):
    inventario_id: uuid.UUID
    cantidad: int = Field(gt=0)
    metodo_pago_id: uuid.UUID | None = None


class VentaCreate(BaseModel):
    items: list[ItemVenta] = Field(min_length=1)
    aprobado: bool = False
    cliente: str | None = Field(default=None, max_length=100)
    presupuesto_id: uuid.UUID | None = None


class VentaUpdate(BaseModel):
    items: list[ItemVenta] | None = Field(default=None, min_length=1)
    aprobado: bool | None = None
    cliente: str | None = Field(default=None, max_length=100)
    presupuesto_id: uuid.UUID | None = None


class VentaDetalleOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    articulo: ArticuloOut
    medida: MedidaOut
    cantidad: int
    precio_venta: Decimal
    sub_total: Decimal
    metodo_pago_id: uuid.UUID | None


class VentaCabeceraOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    fecha: datetime
    numero: int
    cantidad: int
    total: Decimal
    cliente: str | None
    aprobado: bool
    presupuesto_id: uuid.UUID | None
    detalles: list[VentaDetalleOut]


class ResumenVentasOut(BaseModel):
    periodo: PeriodoVentas
    desde: datetime
    hasta: datetime
    total: Decimal
    cantidad_ventas: int
