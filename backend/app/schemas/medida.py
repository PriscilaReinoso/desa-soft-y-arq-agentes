import uuid

from pydantic import BaseModel, ConfigDict, Field


class MedidaCreate(BaseModel):
    unidad_medida: str = Field(min_length=1, max_length=30)
    medida: str = Field(min_length=1, max_length=30)


class MedidaUpdate(BaseModel):
    unidad_medida: str | None = Field(default=None, min_length=1, max_length=30)
    medida: str | None = Field(default=None, min_length=1, max_length=30)


class MedidaOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    unidad_medida: str
    medida: str
