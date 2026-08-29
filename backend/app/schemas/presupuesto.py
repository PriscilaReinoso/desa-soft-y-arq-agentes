import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.articulo import ArticuloOut
from app.schemas.medida import MedidaOut


class ItemPresupuesto(BaseModel):
    inventario_id: uuid.UUID
    cantidad: int = Field(gt=0)


class PresupuestoCreate(BaseModel):
    items: list[ItemPresupuesto] = Field(min_length=1)
    cliente: str | None = Field(default=None, max_length=100)
    dias_valido: Decimal | None = Field(default=None, ge=0, decimal_places=2)


class PresupuestoUpdate(BaseModel):
    items: list[ItemPresupuesto] | None = Field(default=None, min_length=1)
    cliente: str | None = Field(default=None, max_length=100)
    dias_valido: Decimal | None = Field(default=None, ge=0, decimal_places=2)


class PresupuestoDetalleOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    articulo: ArticuloOut
    medida: MedidaOut
    cantidad: int
    precio_venta: Decimal
    sub_total: Decimal


class PresupuestoCabeceraOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    fecha: datetime
    numero: int
    cantidad: int
    total: Decimal
    cliente: str | None
    aprobado: bool
    dias_valido: Decimal | None
    detalles: list[PresupuestoDetalleOut]
