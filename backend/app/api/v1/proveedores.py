import uuid

from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_usuario, require_roles
from app.models.usuario import Usuario
from app.schemas.proveedor import ProveedorCreate, ProveedorOut, ProveedorUpdate
from app.services.proveedor_service import ProveedorService

router = APIRouter(
    prefix="/proveedores",
    tags=["proveedores"],
    dependencies=[Depends(get_current_usuario)],
)


@router.get("", response_model=list[ProveedorOut])
def list_proveedores(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return ProveedorService(db).list(skip=skip, limit=limit)


@router.post("", response_model=ProveedorOut, status_code=status.HTTP_201_CREATED)
def create_proveedor(
    data: ProveedorCreate,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles("ADMIN")),
):
    return ProveedorService(db).create(data)


@router.get("/{proveedor_id}", response_model=ProveedorOut)
def get_proveedor(proveedor_id: uuid.UUID, db: Session = Depends(get_db)):
    return ProveedorService(db).get(proveedor_id)


@router.put("/{proveedor_id}", response_model=ProveedorOut)
def update_proveedor(
    proveedor_id: uuid.UUID,
    data: ProveedorUpdate,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles("ADMIN")),
):
    return ProveedorService(db).update(proveedor_id, data)


@router.delete("/{proveedor_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_proveedor(
    proveedor_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles("ADMIN")),
):
    ProveedorService(db).delete(proveedor_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
