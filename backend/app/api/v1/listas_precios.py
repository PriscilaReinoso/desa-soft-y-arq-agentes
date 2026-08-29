import json
import uuid

from fastapi import APIRouter, Depends, File, Form, Query, Response, UploadFile, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_usuario, require_roles
from app.models.usuario import Usuario
from app.schemas.lista_precios import (
    CantidadListaPorProveedor,
    ListaPreciosAlta,
    ListaPreciosExcelAlta,
    ListaPreciosExcelRespuesta,
    ListaPreciosOut,
    ListaPreciosUpdate,
    ProveedorAlta,
)
from app.services.lista_precios_service import ListaPreciosService

router = APIRouter(
    prefix="/listas-precios",
    tags=["listas de precios"],
    dependencies=[Depends(get_current_usuario)],
)


@router.get("", response_model=list[ListaPreciosOut])
def list_listas_precios(
    skip: int = 0,
    limit: int = 100,
    categoria_ids: list[uuid.UUID] | None = Query(default=None),
    articulos: list[uuid.UUID] | None = Query(default=None),
    proveedor_id: uuid.UUID | None = None,
    db: Session = Depends(get_db),
):
    return ListaPreciosService(db).list(
        skip=skip,
        limit=limit,
        categoria_ids=categoria_ids,
        articulo_ids=articulos,
        proveedor_id=proveedor_id,
    )


@router.post("", response_model=list[ListaPreciosOut], status_code=status.HTTP_201_CREATED)
def alta_lista_precios_json(
    data: ListaPreciosAlta,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles("ADMIN")),
):
    return ListaPreciosService(db).alta_json(data)


@router.post("/excel", response_model=ListaPreciosExcelRespuesta, status_code=status.HTTP_201_CREATED)
def alta_lista_precios_excel(
    archivo: UploadFile = File(...),
    mapeo: str = Form(...),
    proveedor_id: str | None = Form(default=None),
    proveedor: str | None = Form(default=None),
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles("ADMIN")),
):
    proveedor_id_uuid = uuid.UUID(proveedor_id) if proveedor_id else None
    proveedor_obj = ProveedorAlta.model_validate(json.loads(proveedor)) if proveedor else None
    data = ListaPreciosExcelAlta(
        proveedor_id=proveedor_id_uuid,
        proveedor=proveedor_obj,
        mapeo=json.loads(mapeo),
    )
    registros, descartadas = ListaPreciosService(db).alta_excel(data, archivo.file.read())
    return {"registros": registros, "lineas_descartadas": descartadas}


@router.get("/cantidad-por-proveedor", response_model=list[CantidadListaPorProveedor])
def cantidad_listas_precios_por_proveedor(db: Session = Depends(get_db)):
    return ListaPreciosService(db).cantidad_por_proveedor()


@router.get("/{lista_precios_id}", response_model=ListaPreciosOut)
def get_lista_precios(lista_precios_id: uuid.UUID, db: Session = Depends(get_db)):
    return ListaPreciosService(db).get(lista_precios_id)


@router.put("/{lista_precios_id}", response_model=ListaPreciosOut)
def update_lista_precios(
    lista_precios_id: uuid.UUID,
    data: ListaPreciosUpdate,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles("ADMIN")),
):
    return ListaPreciosService(db).update(lista_precios_id, data)


@router.delete("/{lista_precios_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_lista_precios(
    lista_precios_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles("ADMIN")),
):
    ListaPreciosService(db).delete(lista_precios_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
