import uuid

from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_usuario, require_roles
from app.models.usuario import Usuario
from app.schemas.alta_inventario import InventarioAlta
from app.schemas.inventario import InventarioCreate, InventarioOut, InventarioUpdate
from app.services.alta_inventario_service import AltaInventarioService
from app.services.inventario_service import InventarioService

router = APIRouter(
    prefix="/inventarios",
    tags=["inventarios"],
    dependencies=[Depends(get_current_usuario)],
)


@router.post("/alta", response_model=InventarioOut, status_code=status.HTTP_201_CREATED)
def alta_inventario(
    data: InventarioAlta,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles("ADMIN")),
):
    return AltaInventarioService(db).alta(data)


@router.get("", response_model=list[InventarioOut])
def list_inventarios(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return InventarioService(db).list(skip=skip, limit=limit)


@router.post("", response_model=InventarioOut, status_code=status.HTTP_201_CREATED)
def create_inventario(
    data: InventarioCreate,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles("ADMIN")),
):
    return InventarioService(db).create(data)


@router.get("/{inventario_id}", response_model=InventarioOut)
def get_inventario(inventario_id: uuid.UUID, db: Session = Depends(get_db)):
    return InventarioService(db).get(inventario_id)


@router.put("/{inventario_id}", response_model=InventarioOut)
def update_inventario(
    inventario_id: uuid.UUID,
    data: InventarioUpdate,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles("ADMIN")),
):
    return InventarioService(db).update(inventario_id, data)


@router.delete("/{inventario_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_inventario(
    inventario_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles("ADMIN")),
):
    InventarioService(db).delete(inventario_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
