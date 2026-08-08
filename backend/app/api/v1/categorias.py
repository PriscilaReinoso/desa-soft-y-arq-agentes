import uuid

from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_usuario, require_roles
from app.models.usuario import Usuario
from app.schemas.categoria import CategoriaCreate, CategoriaOut, CategoriaUpdate
from app.services.categoria_service import CategoriaService

router = APIRouter(
    prefix="/categorias",
    tags=["categorias"],
    dependencies=[Depends(get_current_usuario)],
)


@router.get("", response_model=list[CategoriaOut])
def list_categorias(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return CategoriaService(db).list(skip=skip, limit=limit)


@router.post("", response_model=CategoriaOut, status_code=status.HTTP_201_CREATED)
def create_categoria(
    data: CategoriaCreate,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles("ADMIN")),
):
    return CategoriaService(db).create(data)


@router.get("/{categoria_id}", response_model=CategoriaOut)
def get_categoria(categoria_id: uuid.UUID, db: Session = Depends(get_db)):
    return CategoriaService(db).get(categoria_id)


@router.put("/{categoria_id}", response_model=CategoriaOut)
def update_categoria(
    categoria_id: uuid.UUID,
    data: CategoriaUpdate,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles("ADMIN")),
):
    return CategoriaService(db).update(categoria_id, data)


@router.delete("/{categoria_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_categoria(
    categoria_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles("ADMIN")),
):
    CategoriaService(db).delete(categoria_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
