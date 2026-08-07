import uuid

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import decode_token
from app.exceptions.base import ForbiddenError, UnauthorizedError
from app.models.usuario import Usuario
from app.repositories.usuario_repository import UsuarioRepository

_bearer = HTTPBearer(auto_error=False)


def get_current_usuario(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
    db: Session = Depends(get_db),
) -> Usuario:
    if credentials is None:
        raise UnauthorizedError(detail="Credenciales no proporcionadas")
    payload = decode_token(credentials.credentials)
    try:
        usuario_id = uuid.UUID(payload["sub"])
    except (KeyError, ValueError):
        raise UnauthorizedError(detail="Token inválido") from None
    usuario = UsuarioRepository(db).get(usuario_id)
    if usuario is None or not usuario.activo:
        raise UnauthorizedError(detail="Usuario no válido")
    return usuario


def require_roles(*roles: str):
    def checker(usuario: Usuario = Depends(get_current_usuario)) -> Usuario:
        if usuario.rol is None or usuario.rol.nombre not in roles:
            raise ForbiddenError(detail="No tiene permisos para esta acción")
        return usuario

    return checker
