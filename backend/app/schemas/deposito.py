import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class DepositoCreate(BaseModel):
    nombre: str = Field(min_length=1, max_length=100)
    descripcion: str | None = None
    direccion: str | None = Field(default=None, max_length=255)


class DepositoUpdate(BaseModel):
    nombre: str | None = Field(default=None, min_length=1, max_length=100)
    descripcion: str | None = None
    direccion: str | None = Field(default=None, max_length=255)


class DepositoOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    nombre: str
    descripcion: str | None
    direccion: str | None
    cantidad_espacios: int
    created_at: datetime
    updated_at: datetime
    deleted_at: datetime | None = None
