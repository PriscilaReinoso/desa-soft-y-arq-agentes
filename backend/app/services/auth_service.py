from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import create_access_token, verify_password
from app.exceptions.base import UnauthorizedError
from app.repositories.usuario_repository import UsuarioRepository
from app.schemas.auth import LoginResponse, UsuarioAuthOut


class AuthService:
    def __init__(self, db: Session):
        self.repository = UsuarioRepository(db)

    def authenticate(self, username: str, password: str) -> LoginResponse:
        usuario = self.repository.get_by_username(username.lower())
        if usuario is None or not verify_password(password, usuario.password_hash):
            raise UnauthorizedError(detail="Username o contraseña incorrectos")
        if not usuario.activo or usuario.deleted_at is not None:
            raise UnauthorizedError(detail="Username o contraseña incorrectos")
        return LoginResponse(
            access_token=create_access_token(usuario),
            expires_in=settings.JWT_EXPIRES_MINUTES * 60,
            usuario=UsuarioAuthOut(
                id=usuario.id,
                nombre=usuario.nombre,
                apellido=usuario.apellido,
                username=usuario.username,
                email=usuario.email,
                rol=usuario.rol.nombre if usuario.rol is not None else "",
            ),
        )
