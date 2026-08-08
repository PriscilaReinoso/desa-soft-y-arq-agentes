import uuid

from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_usuario, require_roles
from app.models.usuario import Usuario
from app.schemas.articulo import ArticuloCreate, ArticuloOut, ArticuloUpdate
from app.services.articulo_service import ArticuloService

router = APIRouter(
    prefix="/articulos",
    tags=["articulos"],
    dependencies=[Depends(get_current_usuario)],
)


@router.get("", response_model=list[ArticuloOut])
def list_articulos(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return ArticuloService(db).list(skip=skip, limit=limit)


@router.post("", response_model=ArticuloOut, status_code=status.HTTP_201_CREATED)
def create_articulo(
    data: ArticuloCreate,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles("ADMIN")),
):
    return ArticuloService(db).create(data)


@router.get("/{articulo_id}", response_model=ArticuloOut)
def get_articulo(articulo_id: uuid.UUID, db: Session = Depends(get_db)):
    return ArticuloService(db).get(articulo_id)


@router.put("/{articulo_id}", response_model=ArticuloOut)
def update_articulo(
    articulo_id: uuid.UUID,
    data: ArticuloUpdate,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles("ADMIN")),
):
    return ArticuloService(db).update(articulo_id, data)


@router.delete("/{articulo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_articulo(
    articulo_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles("ADMIN")),
):
    ArticuloService(db).delete(articulo_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
