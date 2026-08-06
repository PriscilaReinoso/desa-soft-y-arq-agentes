class TestRolCrud:
    def test_crear_rol_exitoso(self, client):
        r = client.post("/api/v1/roles", json={"nombre": "ADMIN", "descripcion": "Administrador"})
        assert r.status_code == 201
        body = r.json()
        assert body["nombre"] == "ADMIN"
        assert body["descripcion"] == "Administrador"
        assert "id" in body

    def test_crear_rol_nombre_duplicado(self, client):
        client.post("/api/v1/roles", json={"nombre": "ADMIN"})
        r = client.post("/api/v1/roles", json={"nombre": "ADMIN"})
        assert r.status_code == 409

    def test_crear_rol_nombre_faltante(self, client):
        r = client.post("/api/v1/roles", json={"descripcion": "sin nombre"})
        assert r.status_code == 422

    def test_listar_roles(self, client):
        client.post("/api/v1/roles", json={"nombre": "ADMIN"})
        client.post("/api/v1/roles", json={"nombre": "CONSULTOR"})
        r = client.get("/api/v1/roles")
        assert r.status_code == 200
        assert len(r.json()) == 2

    def test_obtener_rol_por_id(self, client):
        creado = client.post("/api/v1/roles", json={"nombre": "ADMIN"}).json()
        r = client.get(f"/api/v1/roles/{creado['id']}")
        assert r.status_code == 200
        assert r.json()["nombre"] == "ADMIN"

    def test_obtener_rol_inexistente(self, client):
        r = client.get("/api/v1/roles/00000000-0000-0000-0000-000000000000")
        assert r.status_code == 404

    def test_actualizar_rol(self, client):
        creado = client.post("/api/v1/roles", json={"nombre": "ADMIN"}).json()
        r = client.put(f"/api/v1/roles/{creado['id']}", json={"descripcion": "Nueva desc"})
        assert r.status_code == 200
        assert r.json()["descripcion"] == "Nueva desc"

    def test_actualizar_rol_conflicto_nombre(self, client):
        client.post("/api/v1/roles", json={"nombre": "ADMIN"})
        creado = client.post("/api/v1/roles", json={"nombre": "CONSULTOR"}).json()
        r = client.put(f"/api/v1/roles/{creado['id']}", json={"nombre": "ADMIN"})
        assert r.status_code == 409

    def test_eliminar_rol_baja_logica(self, client):
        creado = client.post("/api/v1/roles", json={"nombre": "ADMIN"}).json()
        r = client.delete(f"/api/v1/roles/{creado['id']}")
        assert r.status_code == 204
        assert client.get(f"/api/v1/roles/{creado['id']}").status_code == 404
        assert client.get("/api/v1/roles").json() == []