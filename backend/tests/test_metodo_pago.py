import uuid


class TestMetodoPagoCrud:
    def test_crear_metodo_pago(self, client, admin_headers):
        r = client.post(
            "/api/v1/metodos-pago",
            json={"nombre": "Efectivo", "descripcion": "Pago en efectivo"},
            headers=admin_headers,
        )
        assert r.status_code == 201, r.text
        body = r.json()
        assert body["nombre"] == "Efectivo"
        assert body["descripcion"] == "Pago en efectivo"

    def test_crear_nombre_duplicado(self, client, admin_headers):
        client.post("/api/v1/metodos-pago", json={"nombre": "Tarjeta"}, headers=admin_headers)
        r = client.post("/api/v1/metodos-pago", json={"nombre": "Tarjeta"}, headers=admin_headers)
        assert r.status_code == 409

    def test_listar_metodos_pago(self, client, admin_headers):
        client.post("/api/v1/metodos-pago", json={"nombre": "Efectivo"}, headers=admin_headers)
        client.post("/api/v1/metodos-pago", json={"nombre": "Transferencia"}, headers=admin_headers)
        r = client.get("/api/v1/metodos-pago", headers=admin_headers)
        assert r.status_code == 200
        assert len(r.json()) == 2

    def test_listar_excluye_eliminados(self, client, admin_headers):
        creado = client.post("/api/v1/metodos-pago", json={"nombre": "Efectivo"}, headers=admin_headers).json()
        client.delete(f"/api/v1/metodos-pago/{creado['id']}", headers=admin_headers)
        r = client.get("/api/v1/metodos-pago", headers=admin_headers)
        assert r.status_code == 200
        assert r.json() == []

    def test_obtener_por_id(self, client, admin_headers):
        creado = client.post("/api/v1/metodos-pago", json={"nombre": "Cheque"}, headers=admin_headers).json()
        r = client.get(f"/api/v1/metodos-pago/{creado['id']}", headers=admin_headers)
        assert r.status_code == 200
        assert r.json()["nombre"] == "Cheque"

    def test_obtener_inexistente(self, client, admin_headers):
        r = client.get(f"/api/v1/metodos-pago/{uuid.uuid4()}", headers=admin_headers)
        assert r.status_code == 404

    def test_actualizar_metodo_pago(self, client, admin_headers):
        creado = client.post("/api/v1/metodos-pago", json={"nombre": "Efectivo"}, headers=admin_headers).json()
        r = client.put(
            f"/api/v1/metodos-pago/{creado['id']}",
            json={"nombre": "Efectivo MEP"},
            headers=admin_headers,
        )
        assert r.status_code == 200, r.text
        assert r.json()["nombre"] == "Efectivo MEP"

    def test_actualizar_inexistente(self, client, admin_headers):
        r = client.put(
            f"/api/v1/metodos-pago/{uuid.uuid4()}",
            json={"nombre": "Otro"},
            headers=admin_headers,
        )
        assert r.status_code == 404

    def test_actualizar_nombre_duplicado(self, client, admin_headers):
        client.post("/api/v1/metodos-pago", json={"nombre": "Efectivo"}, headers=admin_headers)
        creado = client.post("/api/v1/metodos-pago", json={"nombre": "Tarjeta"}, headers=admin_headers).json()
        r = client.put(
            f"/api/v1/metodos-pago/{creado['id']}",
            json={"nombre": "Efectivo"},
            headers=admin_headers,
        )
        assert r.status_code == 409

    def test_eliminar_baja_logica(self, client, admin_headers):
        creado = client.post("/api/v1/metodos-pago", json={"nombre": "Efectivo"}, headers=admin_headers).json()
        r = client.delete(f"/api/v1/metodos-pago/{creado['id']}", headers=admin_headers)
        assert r.status_code == 204
        assert client.get(f"/api/v1/metodos-pago/{creado['id']}", headers=admin_headers).status_code == 404
        assert client.get("/api/v1/metodos-pago", headers=admin_headers).json() == []
