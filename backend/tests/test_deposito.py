class TestDepositoCrud:
    def _crear_deposito(self, client, headers, nombre="Deposito Central", direccion=None):
        payload = {"nombre": nombre}
        if direccion is not None:
            payload["direccion"] = direccion
        return client.post("/api/v1/depositos", json=payload, headers=headers)

    def test_crear_deposito_exitoso(self, client, admin_headers):
        r = self._crear_deposito(client, admin_headers, nombre="Deposito Central", direccion="Av. Siempreviva 123")
        assert r.status_code == 201
        body = r.json()
        assert body["nombre"] == "Deposito Central"
        assert body["direccion"] == "Av. Siempreviva 123"
        assert body["cantidad_espacios"] == 0
        assert "id" in body

    def test_crear_deposito_nombre_faltante(self, client, admin_headers):
        r = client.post("/api/v1/depositos", json={"direccion": "sin nombre"}, headers=admin_headers)
        assert r.status_code == 422

    def test_listar_depositos(self, client, admin_headers):
        self._crear_deposito(client, admin_headers, nombre="Deposito Central")
        self._crear_deposito(client, admin_headers, nombre="Deposito Norte")
        r = client.get("/api/v1/depositos", headers=admin_headers)
        assert r.status_code == 200
        nombres = {x["nombre"] for x in r.json()}
        assert {"Deposito Central", "Deposito Norte"} <= nombres

    def test_obtener_deposito_por_id(self, client, admin_headers):
        creado = self._crear_deposito(client, admin_headers, nombre="Deposito Central").json()
        r = client.get(f"/api/v1/depositos/{creado['id']}", headers=admin_headers)
        assert r.status_code == 200
        assert r.json()["nombre"] == "Deposito Central"

    def test_obtener_deposito_inexistente(self, client, admin_headers):
        r = client.get("/api/v1/depositos/00000000-0000-0000-0000-000000000000", headers=admin_headers)
        assert r.status_code == 404

    def test_actualizar_deposito(self, client, admin_headers):
        creado = self._crear_deposito(client, admin_headers, nombre="Deposito Central").json()
        r = client.put(
            f"/api/v1/depositos/{creado['id']}",
            json={"descripcion": "Sucursal principal"},
            headers=admin_headers,
        )
        assert r.status_code == 200
        assert r.json()["descripcion"] == "Sucursal principal"

    def test_eliminar_deposito_baja_logica(self, client, admin_headers):
        creado = self._crear_deposito(client, admin_headers, nombre="Deposito Central").json()
        r = client.delete(f"/api/v1/depositos/{creado['id']}", headers=admin_headers)
        assert r.status_code == 204
        assert client.get(f"/api/v1/depositos/{creado['id']}", headers=admin_headers).status_code == 404
        nombres = {x["nombre"] for x in client.get("/api/v1/depositos", headers=admin_headers).json()}
        assert "Deposito Central" not in nombres
