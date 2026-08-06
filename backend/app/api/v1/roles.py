import uuid

from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.rol import RolCreate, RolOut, RolUpdate
from app.services.rol_service import RolService

router = APIRouter(prefix="/roles", tags=["roles"])


@router.get("", response_model=list[RolOut])
def list_roles(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return RolService(db).list(skip=skip, limit=limit)


@router.post("", response_model=RolOut, status_code=status.HTTP_201_CREATED)
def create_rol(data: RolCreate, db: Session = Depends(get_db)):
    return RolService(db).create(data)


@router.get("/{rol_id}", response_model=RolOut)
def get_rol(rol_id: uuid.UUID, db: Session = Depends(get_db)):
    return RolService(db).get(rol_id)


@router.put("/{rol_id}", response_model=RolOut)
def update_rol(rol_id: uuid.UUID, data: RolUpdate, db: Session = Depends(get_db)):
    return RolService(db).update(rol_id, data)


@router.delete("/{rol_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_rol(rol_id: uuid.UUID, db: Session = Depends(get_db)):
    RolService(db).delete(rol_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)