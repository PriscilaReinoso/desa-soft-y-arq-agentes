import uuid

from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_usuario, require_roles
from app.models.usuario import Usuario
from app.schemas.espacio import EspacioCreate, EspacioOut, EspacioUpdate
from app.services.espacio_service import EspacioService

router = APIRouter(
    prefix="/espacios",
    tags=["espacios"],
    dependencies=[Depends(get_current_usuario)],
)


@router.get("", response_model=list[EspacioOut])
def list_espacios(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return EspacioService(db).list(skip=skip, limit=limit)


@router.post("", response_model=EspacioOut, status_code=status.HTTP_201_CREATED)
def create_espacio(
    data: EspacioCreate,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles("ADMIN")),
):
    return EspacioService(db).create(data)


@router.get("/{espacio_id}", response_model=EspacioOut)
def get_espacio(espacio_id: uuid.UUID, db: Session = Depends(get_db)):
    return EspacioService(db).get(espacio_id)


@router.put("/{espacio_id}", response_model=EspacioOut)
def update_espacio(
    espacio_id: uuid.UUID,
    data: EspacioUpdate,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles("ADMIN")),
):
    return EspacioService(db).update(espacio_id, data)


@router.delete("/{espacio_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_espacio(
    espacio_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles("ADMIN")),
):
    EspacioService(db).delete(espacio_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
