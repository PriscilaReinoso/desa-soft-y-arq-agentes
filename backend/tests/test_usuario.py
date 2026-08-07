class TestUsuarioCrud:
    def _crear_rol(self, client, headers, nombre="GESTOR"):
        return client.post("/api/v1/roles", json={"nombre": nombre}, headers=headers).json()["id"]

    def _payload_base(self, role_id, username="juan", email="juan@test.com", password="clave123"):
        return {
            "nombre": "Juan",
            "apellido": "Perez",
            "username": username,
            "email": email,
            "password": password,
            "role_id": role_id,
        }

    def test_crear_usuario_exitoso(self, client, admin_headers):
        rol_id = self._crear_rol(client, admin_headers)
        r = client.post("/api/v1/usuarios", json=self._payload_base(rol_id), headers=admin_headers)
        assert r.status_code == 201
        body = r.json()
        assert body["username"] == "juan"
        assert body["email"] == "juan@test.com"
        assert "password" not in body
        assert "password_hash" not in body

    def test_crear_usuario_username_duplicado(self, client, admin_headers):
        rol_id = self._crear_rol(client, admin_headers)
        client.post("/api/v1/usuarios", json=self._payload_base(rol_id), headers=admin_headers)
        r = client.post(
            "/api/v1/usuarios",
            json=self._payload_base(rol_id, email="otro@test.com"),
            headers=admin_headers,
        )
        assert r.status_code == 409

    def test_crear_usuario_email_duplicado(self, client, admin_headers):
        rol_id = self._crear_rol(client, admin_headers)
        client.post("/api/v1/usuarios", json=self._payload_base(rol_id), headers=admin_headers)
        r = client.post(
            "/api/v1/usuarios",
            json=self._payload_base(rol_id, username="otro"),
            headers=admin_headers,
        )
        assert r.status_code == 409

    def test_crear_usuario_rol_inexistente(self, client, admin_headers):
        r = client.post(
            "/api/v1/usuarios",
            json=self._payload_base("00000000-0000-0000-0000-000000000000"),
            headers=admin_headers,
        )
        assert r.status_code == 400

    def test_crear_usuario_datos_incompletos(self, client, admin_headers):
        r = client.post("/api/v1/usuarios", json={"nombre": "Solo nombre"}, headers=admin_headers)
        assert r.status_code == 422

    def test_listar_usuarios(self, client, admin_headers):
        rol_id = self._crear_rol(client, admin_headers)
        client.post("/api/v1/usuarios", json=self._payload_base(rol_id), headers=admin_headers)
        r = client.get("/api/v1/usuarios", headers=admin_headers)
        assert r.status_code == 200
        body = r.json()
        assert any(u["username"] == "juan" for u in body)
        assert all("password_hash" not in u for u in body)
    def test_obtener_usuario_por_id(self, client, admin_headers):
        rol_id = self._crear_rol(client, admin_headers)
        creado = client.post(
            "/api/v1/usuarios", json=self._payload_base(rol_id), headers=admin_headers
        ).json()
        r = client.get(f"/api/v1/usuarios/{creado['id']}", headers=admin_headers)
        assert r.status_code == 200
        assert "password_hash" not in r.json()

    def test_obtener_usuario_inexistente(self, client, admin_headers):
        r = client.get(
            "/api/v1/usuarios/00000000-0000-0000-0000-000000000000", headers=admin_headers
        )
        assert r.status_code == 404

    def test_actualizar_usuario_con_password(self, client, admin_headers):
        rol_id = self._crear_rol(client, admin_headers)
        creado = client.post(
            "/api/v1/usuarios", json=self._payload_base(rol_id), headers=admin_headers
        ).json()
        r = client.put(
            f"/api/v1/usuarios/{creado['id']}",
            json={"password": "nueva123"},
            headers=admin_headers,
        )
        assert r.status_code == 200
        assert "password_hash" not in r.json()

    def test_actualizar_usuario_username_conflicto(self, client, admin_headers):
        rol_id = self._crear_rol(client, admin_headers)
        u1 = client.post(
            "/api/v1/usuarios",
            json=self._payload_base(rol_id, username="a", email="a@test.com"),
            headers=admin_headers,
        ).json()
        client.post(
            "/api/v1/usuarios",
            json=self._payload_base(rol_id, username="b", email="b@test.com"),
            headers=admin_headers,
        )
        r = client.put(
            f"/api/v1/usuarios/{u1['id']}",
            json={"username": "b"},
            headers=admin_headers,
        )
        assert r.status_code == 409

    def test_actualizar_usuario_rol_inexistente(self, client, admin_headers):
        rol_id = self._crear_rol(client, admin_headers)
        creado = client.post(
            "/api/v1/usuarios", json=self._payload_base(rol_id), headers=admin_headers
        ).json()
        r = client.put(
            f"/api/v1/usuarios/{creado['id']}",
            json={"role_id": "00000000-0000-0000-0000-000000000000"},
            headers=admin_headers,
        )
        assert r.status_code == 400

    def test_eliminar_usuario_baja_logica(self, client, admin_headers):
        rol_id = self._crear_rol(client, admin_headers)
        creado = client.post(
            "/api/v1/usuarios", json=self._payload_base(rol_id), headers=admin_headers
        ).json()
        r = client.delete(f"/api/v1/usuarios/{creado['id']}", headers=admin_headers)
        assert r.status_code == 204
        assert client.get(
            f"/api/v1/usuarios/{creado['id']}", headers=admin_headers
        ).status_code == 404
        lista = client.get("/api/v1/usuarios", headers=admin_headers).json()
        assert all(u["id"] != creado["id"] for u in lista)
