import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class InventarioCreate(BaseModel):
    articulo_id: uuid.UUID
    medida_id: uuid.UUID
    espacio_id: uuid.UUID | None = None
    fila: int | None = Field(default=None, ge=0)
    columna: int | None = Field(default=None, ge=0)
    stock: int = Field(default=0, ge=0)
    precio_venta: Decimal = Field(ge=0, decimal_places=2)


class InventarioUpdate(BaseModel):
    espacio_id: uuid.UUID | None = None
    fila: int | None = Field(default=None, ge=0)
    columna: int | None = Field(default=None, ge=0)
    stock: int | None = Field(default=None, ge=0)
    precio_venta: Decimal | None = Field(default=None, ge=0, decimal_places=2)


class InventarioOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    articulo_id: uuid.UUID
    medida_id: uuid.UUID
    espacio_id: uuid.UUID | None = None
    fila: int | None = None
    columna: int | None = None
    stock: int
    precio_venta: Decimal
    created_at: datetime
    updated_at: datetime
    deleted_at: datetime | None = None
