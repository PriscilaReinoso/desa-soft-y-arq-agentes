import uuid

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.espacio import EspacioOut


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


class DepositoDetalleOut(DepositoOut):
    espacios: list[EspacioOut] = []
