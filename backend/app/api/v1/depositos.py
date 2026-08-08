import uuid

from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_usuario, require_roles
from app.models.usuario import Usuario
from app.schemas.deposito import DepositoCreate, DepositoOut, DepositoUpdate
from app.services.deposito_service import DepositoService

router = APIRouter(
    prefix="/depositos",
    tags=["depositos"],
    dependencies=[Depends(get_current_usuario)],
)


@router.get("", response_model=list[DepositoOut])
def list_depositos(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return DepositoService(db).list(skip=skip, limit=limit)


@router.post("", response_model=DepositoOut, status_code=status.HTTP_201_CREATED)
def create_deposito(
    data: DepositoCreate,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles("ADMIN")),
):
    return DepositoService(db).create(data)


@router.get("/{deposito_id}", response_model=DepositoOut)
def get_deposito(deposito_id: uuid.UUID, db: Session = Depends(get_db)):
    return DepositoService(db).get(deposito_id)


@router.put("/{deposito_id}", response_model=DepositoOut)
def update_deposito(
    deposito_id: uuid.UUID,
    data: DepositoUpdate,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles("ADMIN")),
):
    return DepositoService(db).update(deposito_id, data)


@router.delete("/{deposito_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_deposito(
    deposito_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles("ADMIN")),
):
    DepositoService(db).delete(deposito_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
