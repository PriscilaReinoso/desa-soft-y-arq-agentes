import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.usuario import Usuario


class UsuarioRepository:
    def __init__(self, db: Session):
        self.db = db

    def list(self, skip: int = 0, limit: int = 100) -> list[Usuario]:
        stmt = (
            select(Usuario)
            .where(Usuario.deleted_at.is_(None))
            .order_by(Usuario.apellido, Usuario.nombre)
            .offset(skip)
            .limit(limit)
        )
        return list(self.db.scalars(stmt).all())

    def get(self, usuario_id: uuid.UUID) -> Usuario | None:
        stmt = select(Usuario).where(Usuario.id == usuario_id, Usuario.deleted_at.is_(None))
        return self.db.scalar(stmt)

    def get_by_email(self, email: str) -> Usuario | None:
        stmt = select(Usuario).where(Usuario.email == email)
        return self.db.scalar(stmt)

    def add(self, usuario: Usuario) -> Usuario:
        self.db.add(usuario)
        self.db.commit()
        self.db.refresh(usuario)
        return usuario

    def update(self, usuario: Usuario) -> Usuario:
        self.db.add(usuario)
        self.db.commit()
        self.db.refresh(usuario)
        return usuario

    def soft_delete(self, usuario: Usuario) -> None:
        self.db.add(usuario)
        self.db.commit()