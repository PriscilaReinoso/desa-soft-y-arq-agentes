import uuid

from pydantic import BaseModel, ConfigDict, Field


class MetodoPagoCreate(BaseModel):
    nombre: str = Field(min_length=1, max_length=50)
    descripcion: str | None = None


class MetodoPagoUpdate(BaseModel):
    nombre: str | None = Field(default=None, min_length=1, max_length=50)
    descripcion: str | None = None


class MetodoPagoOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    nombre: str
    descripcion: str | None
