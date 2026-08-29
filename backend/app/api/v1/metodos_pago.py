import uuid

from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_usuario, require_roles
from app.models.usuario import Usuario
from app.schemas.metodo_pago import MetodoPagoCreate, MetodoPagoOut, MetodoPagoUpdate
from app.services.metodo_pago_service import MetodoPagoService

router = APIRouter(
    prefix="/metodos-pago",
    tags=["métodos de pago"],
    dependencies=[Depends(get_current_usuario)],
)


@router.get("", response_model=list[MetodoPagoOut])
def list_metodos_pago(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return MetodoPagoService(db).list(skip=skip, limit=limit)


@router.post("", response_model=MetodoPagoOut, status_code=status.HTTP_201_CREATED)
def create_metodo_pago(
    data: MetodoPagoCreate,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles("ADMIN")),
):
    return MetodoPagoService(db).create(data)


@router.get("/{metodo_pago_id}", response_model=MetodoPagoOut)
def get_metodo_pago(metodo_pago_id: uuid.UUID, db: Session = Depends(get_db)):
    return MetodoPagoService(db).get(metodo_pago_id)


@router.put("/{metodo_pago_id}", response_model=MetodoPagoOut)
def update_metodo_pago(
    metodo_pago_id: uuid.UUID,
    data: MetodoPagoUpdate,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles("ADMIN")),
):
    return MetodoPagoService(db).update(metodo_pago_id, data)


@router.delete("/{metodo_pago_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_metodo_pago(
    metodo_pago_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles("ADMIN")),
):
    MetodoPagoService(db).delete(metodo_pago_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
