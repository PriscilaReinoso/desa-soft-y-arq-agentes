from datetime import UTC, datetime, timedelta

import jwt as pyjwt

from app.core.config import settings


def _token(sub, exp_delta):
    now = datetime.now(UTC)
    payload = {"sub": sub, "role": "ADMIN", "iat": now, "exp": now + exp_delta}
    return pyjwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def _auth(token):
    return {"Authorization": f"Bearer {token}"}


class TestLogin:
    def test_login_exitoso(self, client, crear_usuario):
        data = crear_usuario(rol="ADMIN", username="jperez")
        r = client.post(
            "/api/v1/auth/login", json={"username": data["username"], "password": data["password"]}
        )
        assert r.status_code == 200
        body = r.json()
        assert body["access_token"]
        assert body["token_type"] == "bearer"
        assert body["expires_in"] == settings.JWT_EXPIRES_MINUTES * 60
        assert body["usuario"]["username"] == "jperez"
        assert body["usuario"]["rol"] == "ADMIN"
        assert "password_hash" not in body["usuario"]

    def test_login_credenciales_invalidas(self, client, crear_usuario):
        data = crear_usuario()
        r = client.post(
            "/api/v1/auth/login", json={"username": data["username"], "password": "incorrecta"}
        )
        assert r.status_code == 401

    def test_login_username_inexistente(self, client):
        r = client.post(
            "/api/v1/auth/login", json={"username": "nadie", "password": "clave123"}
        )
        assert r.status_code == 401

    def test_login_usuario_inactivo(self, client, crear_usuario):
        data = crear_usuario(rol="ADMIN", username="inactivo", activo=False)
        r = client.post(
            "/api/v1/auth/login", json={"username": data["username"], "password": data["password"]}
        )
        assert r.status_code == 401

    def test_login_usuario_eliminado(self, client, crear_usuario):
        data = crear_usuario(rol="ADMIN", username="eliminado", deleted=True)
        r = client.post(
            "/api/v1/auth/login", json={"username": data["username"], "password": data["password"]}
        )
        assert r.status_code == 401

    def test_login_datos_incompletos(self, client):
        r = client.post("/api/v1/auth/login", json={"username": "alguien"})
        assert r.status_code == 422


class TestProteccion:
    def test_acceso_sin_token(self, client):
        assert client.get("/api/v1/roles").status_code == 401
        assert client.get("/api/v1/usuarios").status_code == 401

    def test_token_invalido(self, client):
        r = client.get("/api/v1/roles", headers=_auth("token-invalido"))
        assert r.status_code == 401

    def test_token_expirado(self, client, crear_usuario):
        data = crear_usuario()
        token = _token(data["id"], exp_delta=-timedelta(minutes=5))
        assert client.get("/api/v1/roles", headers=_auth(token)).status_code == 401

    def test_token_usuario_inactivo(self, client, crear_usuario):
        data = crear_usuario(activo=False)
        token = _token(data["id"], exp_delta=timedelta(minutes=30))
        assert client.get("/api/v1/roles", headers=_auth(token)).status_code == 401

    def test_token_usuario_eliminado(self, client, crear_usuario):
        data = crear_usuario(deleted=True)
        token = _token(data["id"], exp_delta=timedelta(minutes=30))
        assert client.get("/api/v1/roles", headers=_auth(token)).status_code == 401

    def test_login_no_requiere_token(self, client, crear_usuario):
        data = crear_usuario()
        r = client.post(
            "/api/v1/auth/login", json={"username": data["username"], "password": data["password"]}
        )
        assert r.status_code == 200


class TestAutorizacion:
    def test_admin_puede_leer_y_escribir(self, client, admin_headers):
        r = client.post("/api/v1/roles", json={"nombre": "GESTOR"}, headers=admin_headers)
        assert r.status_code == 201
        assert client.get("/api/v1/roles", headers=admin_headers).status_code == 200

    def test_consultor_puede_leer(self, client, consultor_headers):
        assert client.get("/api/v1/roles", headers=consultor_headers).status_code == 200
        assert client.get("/api/v1/usuarios", headers=consultor_headers).status_code == 200

    def test_consultor_no_puede_escribir(self, client, consultor_headers):
        r = client.post("/api/v1/roles", json={"nombre": "ADMIN"}, headers=consultor_headers)
        assert r.status_code == 403
        rol_id = "00000000-0000-0000-0000-000000000000"
        assert client.put(
            f"/api/v1/roles/{rol_id}", json={"nombre": "X"}, headers=consultor_headers
        ).status_code == 403
        assert client.delete(f"/api/v1/roles/{rol_id}", headers=consultor_headers).status_code == 403
        assert client.post(
            "/api/v1/usuarios",
            json={
                "nombre": "A",
                "apellido": "B",
                "username": "ab",
                "email": "ab@test.com",
                "password": "clave123",
                "role_id": rol_id,
            },
            headers=consultor_headers,
        ).status_code == 403
