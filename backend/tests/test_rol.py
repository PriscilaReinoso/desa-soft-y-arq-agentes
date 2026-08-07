class TestRolCrud:
    def _crear_rol(self, client, headers, nombre, descripcion=None):
        payload = {"nombre": nombre}
        if descripcion is not None:
            payload["descripcion"] = descripcion
        return client.post("/api/v1/roles", json=payload, headers=headers)

    def test_crear_rol_exitoso(self, client, admin_headers):
        r = self._crear_rol(client, admin_headers, nombre="GESTOR", descripcion="Gestor")
        assert r.status_code == 201
        body = r.json()
        assert body["nombre"] == "GESTOR"
        assert body["descripcion"] == "Gestor"
        assert "id" in body

    def test_crear_rol_nombre_duplicado(self, client, admin_headers):
        self._crear_rol(client, admin_headers, nombre="GESTOR")
        r = self._crear_rol(client, admin_headers, nombre="GESTOR")
        assert r.status_code == 409

    def test_crear_rol_nombre_faltante(self, client, admin_headers):
        r = client.post("/api/v1/roles", json={"descripcion": "sin nombre"}, headers=admin_headers)
        assert r.status_code == 422

    def test_listar_roles(self, client, admin_headers):
        self._crear_rol(client, admin_headers, nombre="GESTOR")
        self._crear_rol(client, admin_headers, nombre="SUPERVISOR")
        r = client.get("/api/v1/roles", headers=admin_headers)
        assert r.status_code == 200
        nombres = {x["nombre"] for x in r.json()}
        assert {"GESTOR", "SUPERVISOR"} <= nombres

    def test_obtener_rol_por_id(self, client, admin_headers):
        creado = self._crear_rol(client, admin_headers, nombre="GESTOR").json()
        r = client.get(f"/api/v1/roles/{creado['id']}", headers=admin_headers)
        assert r.status_code == 200
        assert r.json()["nombre"] == "GESTOR"

    def test_obtener_rol_inexistente(self, client, admin_headers):
        r = client.get("/api/v1/roles/00000000-0000-0000-0000-000000000000", headers=admin_headers)
        assert r.status_code == 404

    def test_actualizar_rol(self, client, admin_headers):
        creado = self._crear_rol(client, admin_headers, nombre="GESTOR").json()
        r = client.put(
            f"/api/v1/roles/{creado['id']}",
            json={"descripcion": "Nueva desc"},
            headers=admin_headers,
        )
        assert r.status_code == 200
        assert r.json()["descripcion"] == "Nueva desc"

    def test_actualizar_rol_conflicto_nombre(self, client, admin_headers):
        self._crear_rol(client, admin_headers, nombre="GESTOR")
        creado = self._crear_rol(client, admin_headers, nombre="SUPERVISOR").json()
        r = client.put(
            f"/api/v1/roles/{creado['id']}",
            json={"nombre": "GESTOR"},
            headers=admin_headers,
        )
        assert r.status_code == 409

    def test_eliminar_rol_baja_logica(self, client, admin_headers):
        creado = self._crear_rol(client, admin_headers, nombre="GESTOR").json()
        r = client.delete(f"/api/v1/roles/{creado['id']}", headers=admin_headers)
        assert r.status_code == 204
        assert client.get(f"/api/v1/roles/{creado['id']}", headers=admin_headers).status_code == 404
        nombres = {x["nombre"] for x in client.get("/api/v1/roles", headers=admin_headers).json()}
        assert "GESTOR" not in nombres
