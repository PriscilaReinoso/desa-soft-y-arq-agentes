class TestEspacioCrud:
    def _crear_deposito(self, client, headers, nombre="Deposito Central"):
        r = client.post("/api/v1/depositos", json={"nombre": nombre}, headers=headers)
        assert r.status_code == 201, r.text
        return r.json()

    def _crear_espacio(self, client, headers, deposito_id, tipo="estanteria", max_fila=5, max_columna=3):
        payload = {"deposito_id": deposito_id, "tipo": tipo, "max_fila": max_fila, "max_columna": max_columna}
        return client.post("/api/v1/espacios", json=payload, headers=headers)

    def test_crear_espacio_exitoso(self, client, admin_headers):
        dep = self._crear_deposito(client, admin_headers)
        r = self._crear_espacio(client, admin_headers, dep["id"])
        assert r.status_code == 201
        body = r.json()
        assert body["tipo"] == "estanteria"
        assert body["deposito_id"] == dep["id"]
        assert body["max_fila"] == 5
        assert body["max_columna"] == 3
        # sincronización de cantidad_espacios
        dep_actualizado = client.get(f"/api/v1/depositos/{dep['id']}", headers=admin_headers).json()
        assert dep_actualizado["cantidad_espacios"] == 1

    def test_crear_espacio_deposito_inexistente(self, client, admin_headers):
        r = self._crear_espacio(
            client, admin_headers, "00000000-0000-0000-0000-000000000000"
        )
        assert r.status_code == 400

    def test_crear_espacio_campos_faltantes(self, client, admin_headers):
        r = client.post("/api/v1/espacios", json={"tipo": "estanteria"}, headers=admin_headers)
        assert r.status_code == 422

    def test_listar_espacios(self, client, admin_headers):
        dep = self._crear_deposito(client, admin_headers)
        self._crear_espacio(client, admin_headers, dep["id"], tipo="estanteria")
        self._crear_espacio(client, admin_headers, dep["id"], tipo="mostrador")
        r = client.get("/api/v1/espacios", headers=admin_headers)
        assert r.status_code == 200
        tipos = {x["tipo"] for x in r.json()}
        assert {"estanteria", "mostrador"} <= tipos

    def test_obtener_espacio_por_id(self, client, admin_headers):
        dep = self._crear_deposito(client, admin_headers)
        creado = self._crear_espacio(client, admin_headers, dep["id"]).json()
        r = client.get(f"/api/v1/espacios/{creado['id']}", headers=admin_headers)
        assert r.status_code == 200
        assert r.json()["tipo"] == "estanteria"

    def test_obtener_espacio_inexistente(self, client, admin_headers):
        r = client.get("/api/v1/espacios/00000000-0000-0000-0000-000000000000", headers=admin_headers)
        assert r.status_code == 404

    def test_actualizar_espacio(self, client, admin_headers):
        dep = self._crear_deposito(client, admin_headers)
        creado = self._crear_espacio(client, admin_headers, dep["id"]).json()
        r = client.put(
            f"/api/v1/espacios/{creado['id']}",
            json={"max_fila": 10},
            headers=admin_headers,
        )
        assert r.status_code == 200
        assert r.json()["max_fila"] == 10

    def test_eliminar_espacio_baja_logica(self, client, admin_headers):
        dep = self._crear_deposito(client, admin_headers)
        creado = self._crear_espacio(client, admin_headers, dep["id"]).json()
        r = client.delete(f"/api/v1/espacios/{creado['id']}", headers=admin_headers)
        assert r.status_code == 204
        assert client.get(f"/api/v1/espacios/{creado['id']}", headers=admin_headers).status_code == 404
        # decremento de cantidad_espacios
        dep_actualizado = client.get(f"/api/v1/depositos/{dep['id']}", headers=admin_headers).json()
        assert dep_actualizado["cantidad_espacios"] == 0
