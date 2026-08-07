import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db, utcnow
from app.core.security import hash_password
from app.main import app
from app.models.rol import Rol
from app.models.usuario import Usuario

engine = create_engine(
    "sqlite+pysqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture()
def client():
    Base.metadata.create_all(bind=engine)
    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def db_session():
    session = TestingSessionLocal()
    yield session
    session.close()


@pytest.fixture()
def crear_usuario(client, db_session):
    def _crear(rol="ADMIN", username=None, email=None, password="clave123", activo=True, deleted=False):
        username = username or f"{rol.lower()}_test"
        email = email or f"{username}@test.com"
        rol_obj = Rol(nombre=rol)
        db_session.add(rol_obj)
        db_session.commit()
        db_session.refresh(rol_obj)
        usuario = Usuario(
            nombre="Test",
            apellido="User",
            username=username,
            email=email,
            password_hash=hash_password(password),
            role_id=rol_obj.id,
            activo=activo,
        )
        db_session.add(usuario)
        db_session.commit()
        db_session.refresh(usuario)
        if deleted:
            usuario.deleted_at = utcnow()
            db_session.add(usuario)
            db_session.commit()
        return {"id": str(usuario.id), "username": username, "email": email, "password": password, "rol": rol}

    return _crear


@pytest.fixture()
def get_auth_headers(client, crear_usuario):
    def _get(rol="ADMIN", username=None, password="clave123"):
        data = crear_usuario(rol=rol, username=username, password=password)
        r = client.post(
            "/api/v1/auth/login", json={"username": data["username"], "password": password}
        )
        assert r.status_code == 200, r.text
        return {"Authorization": f"Bearer {r.json()['access_token']}"}

    return _get


@pytest.fixture()
def admin_headers(get_auth_headers):
    return get_auth_headers("ADMIN")


@pytest.fixture()
def consultor_headers(get_auth_headers):
    return get_auth_headers("CONSULTOR")
