import uuid

from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_usuario, require_roles
from app.models.usuario import Usuario
from app.schemas.usuario import UsuarioCreate, UsuarioOut, UsuarioUpdate
from app.services.usuario_service import UsuarioService

router = APIRouter(
    prefix="/usuarios",
    tags=["usuarios"],
    dependencies=[Depends(get_current_usuario)],
)


@router.get("", response_model=list[UsuarioOut])
def list_usuarios(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return UsuarioService(db).list(skip=skip, limit=limit)


@router.post("", response_model=UsuarioOut, status_code=status.HTTP_201_CREATED)
def create_usuario(
    data: UsuarioCreate,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles("ADMIN")),
):
    return UsuarioService(db).create(data)


@router.get("/{usuario_id}", response_model=UsuarioOut)
def get_usuario(usuario_id: uuid.UUID, db: Session = Depends(get_db)):
    return UsuarioService(db).get(usuario_id)


@router.put("/{usuario_id}", response_model=UsuarioOut)
def update_usuario(
    usuario_id: uuid.UUID,
    data: UsuarioUpdate,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles("ADMIN")),
):
    return UsuarioService(db).update(usuario_id, data)


@router.delete("/{usuario_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_usuario(
    usuario_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles("ADMIN")),
):
    UsuarioService(db).delete(usuario_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
