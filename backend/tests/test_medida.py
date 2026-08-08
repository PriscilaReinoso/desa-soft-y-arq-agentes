class TestMedidaCrud:
    def _crear_medida(self, client, headers, unidad="pulgada", medida="1/2"):
        return client.post(
            "/api/v1/medidas", json={"unidad_medida": unidad, "medida": medida}, headers=headers
        )

    def test_crear_medida_exitosa(self, client, admin_headers):
        r = self._crear_medida(client, admin_headers, unidad="pulgada", medida="1/2")
        assert r.status_code == 201
        body = r.json()
        assert body["unidad_medida"] == "pulgada"
        assert body["medida"] == "1/2"
        assert "id" in body

    def test_crear_medida_combinacion_duplicada(self, client, admin_headers):
        self._crear_medida(client, admin_headers, unidad="pulgada", medida="1/2")
        r = self._crear_medida(client, admin_headers, unidad="pulgada", medida="1/2")
        assert r.status_code == 409

    def test_crear_medida_campos_faltantes(self, client, admin_headers):
        r = client.post("/api/v1/medidas", json={"unidad_medida": "pulgada"}, headers=admin_headers)
        assert r.status_code == 422
        r = client.post("/api/v1/medidas", json={"medida": "1/2"}, headers=admin_headers)
        assert r.status_code == 422

    def test_listar_medidas(self, client, admin_headers):
        self._crear_medida(client, admin_headers, unidad="pulgada", medida="1/2")
        self._crear_medida(client, admin_headers, unidad="milimetro", medida="10")
        r = client.get("/api/v1/medidas", headers=admin_headers)
        assert r.status_code == 200
        combos = {(x["unidad_medida"], x["medida"]) for x in r.json()}
        assert {("pulgada", "1/2"), ("milimetro", "10")} <= combos

    def test_obtener_medida_por_id(self, client, admin_headers):
        creada = self._crear_medida(client, admin_headers, unidad="pulgada", medida="1/2").json()
        r = client.get(f"/api/v1/medidas/{creada['id']}", headers=admin_headers)
        assert r.status_code == 200
        assert r.json()["medida"] == "1/2"

    def test_obtener_medida_inexistente(self, client, admin_headers):
        r = client.get("/api/v1/medidas/00000000-0000-0000-0000-000000000000", headers=admin_headers)
        assert r.status_code == 404

    def test_actualizar_medida(self, client, admin_headers):
        creada = self._crear_medida(client, admin_headers, unidad="pulgada", medida="1/2").json()
        r = client.put(
            f"/api/v1/medidas/{creada['id']}",
            json={"medida": "3/4"},
            headers=admin_headers,
        )
        assert r.status_code == 200
        assert r.json()["medida"] == "3/4"

    def test_actualizar_medida_conflicto(self, client, admin_headers):
        self._crear_medida(client, admin_headers, unidad="pulgada", medida="1/2")
        creada = self._crear_medida(client, admin_headers, unidad="pulgada", medida="3/4").json()
        r = client.put(
            f"/api/v1/medidas/{creada['id']}",
            json={"medida": "1/2"},
            headers=admin_headers,
        )
        assert r.status_code == 409

    def test_eliminar_medida_baja_logica(self, client, admin_headers):
        creada = self._crear_medida(client, admin_headers, unidad="pulgada", medida="1/2").json()
        r = client.delete(f"/api/v1/medidas/{creada['id']}", headers=admin_headers)
        assert r.status_code == 204
        assert client.get(f"/api/v1/medidas/{creada['id']}", headers=admin_headers).status_code == 404
        combos = {(x["unidad_medida"], x["medida"]) for x in client.get("/api/v1/medidas", headers=admin_headers).json()}
        assert ("pulgada", "1/2") not in combos
