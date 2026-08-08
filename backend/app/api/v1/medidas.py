import uuid

from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_usuario, require_roles
from app.models.usuario import Usuario
from app.schemas.medida import MedidaCreate, MedidaOut, MedidaUpdate
from app.services.medida_service import MedidaService

router = APIRouter(
    prefix="/medidas",
    tags=["medidas"],
    dependencies=[Depends(get_current_usuario)],
)


@router.get("", response_model=list[MedidaOut])
def list_medidas(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return MedidaService(db).list(skip=skip, limit=limit)


@router.post("", response_model=MedidaOut, status_code=status.HTTP_201_CREATED)
def create_medida(
    data: MedidaCreate,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles("ADMIN")),
):
    return MedidaService(db).create(data)


@router.get("/{medida_id}", response_model=MedidaOut)
def get_medida(medida_id: uuid.UUID, db: Session = Depends(get_db)):
    return MedidaService(db).get(medida_id)


@router.put("/{medida_id}", response_model=MedidaOut)
def update_medida(
    medida_id: uuid.UUID,
    data: MedidaUpdate,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles("ADMIN")),
):
    return MedidaService(db).update(medida_id, data)


@router.delete("/{medida_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_medida(
    medida_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles("ADMIN")),
):
    MedidaService(db).delete(medida_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
