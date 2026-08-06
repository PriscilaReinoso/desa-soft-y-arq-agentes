class TestUsuarioCrud:
    def _crear_rol(self, client, nombre="ADMIN"):
        return client.post("/api/v1/roles", json={"nombre": nombre}).json()["id"]

    def _payload_base(self, role_id, email="juan@test.com", password="clave123"):
        return {
            "nombre": "Juan",
            "apellido": "Perez",
            "email": email,
            "password": password,
            "role_id": role_id,
        }

    def test_crear_usuario_exitoso(self, client):
        rol_id = self._crear_rol(client)
        r = client.post("/api/v1/usuarios", json=self._payload_base(rol_id))
        assert r.status_code == 201
        body = r.json()
        assert body["email"] == "juan@test.com"
        assert "password" not in body
        assert "password_hash" not in body

    def test_crear_usuario_email_duplicado(self, client):
        rol_id = self._crear_rol(client)
        client.post("/api/v1/usuarios", json=self._payload_base(rol_id))
        r = client.post("/api/v1/usuarios", json=self._payload_base(rol_id))
        assert r.status_code == 409

    def test_crear_usuario_rol_inexistente(self, client):
        r = client.post(
            "/api/v1/usuarios",
            json=self._payload_base("00000000-0000-0000-0000-000000000000"),
        )
        assert r.status_code == 400

    def test_crear_usuario_datos_incompletos(self, client):
        r = client.post("/api/v1/usuarios", json={"nombre": "Solo nombre"})
        assert r.status_code == 422

    def test_listar_usuarios(self, client):
        rol_id = self._crear_rol(client)
        client.post("/api/v1/usuarios", json=self._payload_base(rol_id))
        r = client.get("/api/v1/usuarios")
        assert r.status_code == 200
        body = r.json()
        assert len(body) == 1
        assert "password_hash" not in body[0]

    def test_obtener_usuario_por_id(self, client):
        rol_id = self._crear_rol(client)
        creado = client.post("/api/v1/usuarios", json=self._payload_base(rol_id)).json()
        r = client.get(f"/api/v1/usuarios/{creado['id']}")
        assert r.status_code == 200
        assert "password_hash" not in r.json()

    def test_obtener_usuario_inexistente(self, client):
        r = client.get("/api/v1/usuarios/00000000-0000-0000-0000-000000000000")
        assert r.status_code == 404

    def test_actualizar_usuario_con_password(self, client):
        rol_id = self._crear_rol(client)
        creado = client.post("/api/v1/usuarios", json=self._payload_base(rol_id)).json()
        r = client.put(f"/api/v1/usuarios/{creado['id']}", json={"password": "nueva123"})
        assert r.status_code == 200
        assert "password_hash" not in r.json()

    def test_actualizar_usuario_email_conflicto(self, client):
        rol_id = self._crear_rol(client)
        u1 = client.post("/api/v1/usuarios", json=self._payload_base(rol_id, email="a@test.com")).json()
        client.post("/api/v1/usuarios", json=self._payload_base(rol_id, email="b@test.com"))
        r = client.put(f"/api/v1/usuarios/{u1['id']}", json={"email": "b@test.com"})
        assert r.status_code == 409

    def test_actualizar_usuario_rol_inexistente(self, client):
        rol_id = self._crear_rol(client)
        creado = client.post("/api/v1/usuarios", json=self._payload_base(rol_id)).json()
        r = client.put(
            f"/api/v1/usuarios/{creado['id']}",
            json={"role_id": "00000000-0000-0000-0000-000000000000"},
        )
        assert r.status_code == 400

    def test_eliminar_usuario_baja_logica(self, client):
        rol_id = self._crear_rol(client)
        creado = client.post("/api/v1/usuarios", json=self._payload_base(rol_id)).json()
        r = client.delete(f"/api/v1/usuarios/{creado['id']}")
        assert r.status_code == 204
        assert client.get(f"/api/v1/usuarios/{creado['id']}").status_code == 404
        assert client.get("/api/v1/usuarios").json() == []