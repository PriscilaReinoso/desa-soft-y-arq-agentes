class TestCategoriaCrud:
    def _crear_categoria(self, client, headers, nombre, descripcion=None):
        payload = {"nombre": nombre}
        if descripcion is not None:
            payload["descripcion"] = descripcion
        return client.post("/api/v1/categorias", json=payload, headers=headers)

    def test_crear_categoria_exitosa(self, client, admin_headers):
        r = self._crear_categoria(client, admin_headers, nombre="HERRAMIENTAS", descripcion="Herramientas")
        assert r.status_code == 201
        body = r.json()
        assert body["nombre"] == "HERRAMIENTAS"
        assert body["descripcion"] == "Herramientas"
        assert "id" in body

    def test_crear_categoria_nombre_duplicado(self, client, admin_headers):
        self._crear_categoria(client, admin_headers, nombre="HERRAMIENTAS")
        r = self._crear_categoria(client, admin_headers, nombre="HERRAMIENTAS")
        assert r.status_code == 409

    def test_crear_categoria_nombre_faltante(self, client, admin_headers):
        r = client.post("/api/v1/categorias", json={"descripcion": "sin nombre"}, headers=admin_headers)
        assert r.status_code == 422

    def test_listar_categorias(self, client, admin_headers):
        self._crear_categoria(client, admin_headers, nombre="HERRAMIENTAS")
        self._crear_categoria(client, admin_headers, nombre="PINTURERIA")
        r = client.get("/api/v1/categorias", headers=admin_headers)
        assert r.status_code == 200
        nombres = {x["nombre"] for x in r.json()}
        assert {"HERRAMIENTAS", "PINTURERIA"} <= nombres

    def test_obtener_categoria_por_id(self, client, admin_headers):
        creada = self._crear_categoria(client, admin_headers, nombre="HERRAMIENTAS").json()
        r = client.get(f"/api/v1/categorias/{creada['id']}", headers=admin_headers)
        assert r.status_code == 200
        assert r.json()["nombre"] == "HERRAMIENTAS"

    def test_obtener_categoria_inexistente(self, client, admin_headers):
        r = client.get("/api/v1/categorias/00000000-0000-0000-0000-000000000000", headers=admin_headers)
        assert r.status_code == 404

    def test_eliminar_categoria_baja_logica(self, client, admin_headers):
        creada = self._crear_categoria(client, admin_headers, nombre="HERRAMIENTAS").json()
        r = client.delete(f"/api/v1/categorias/{creada['id']}", headers=admin_headers)
        assert r.status_code == 204
        assert client.get(f"/api/v1/categorias/{creada['id']}", headers=admin_headers).status_code == 404
        nombres = {x["nombre"] for x in client.get("/api/v1/categorias", headers=admin_headers).json()}
        assert "HERRAMIENTAS" not in nombres
