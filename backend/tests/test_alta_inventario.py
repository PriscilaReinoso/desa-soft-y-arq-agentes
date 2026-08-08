class TestAltaInventario:
    def _crear_categoria(self, client, headers, nombre):
        r = client.post("/api/v1/categorias", json={"nombre": nombre}, headers=headers)
        assert r.status_code == 201, r.text
        return r.json()

    def _crear_deposito(self, client, headers, nombre):
        r = client.post("/api/v1/depositos", json={"nombre": nombre}, headers=headers)
        assert r.status_code == 201, r.text
        return r.json()

    def _crear_articulo(self, client, headers, nombre="Martillo"):
        cat = self._crear_categoria(client, headers, f"CAT_{nombre}")
        r = client.post("/api/v1/articulos", json={"nombre": nombre, "categoria_id": cat["id"]}, headers=headers)
        assert r.status_code == 201, r.text
        return r.json()

    def _crear_medida(self, client, headers, unidad="unidad", medida="unidad"):
        r = client.post("/api/v1/medidas", json={"unidad_medida": unidad, "medida": medida}, headers=headers)
        assert r.status_code == 201, r.text
        return r.json()

    def _crear_espacio(self, client, headers, deposito_id):
        r = client.post(
            "/api/v1/espacios",
            json={"deposito_id": deposito_id, "tipo": "estanteria", "max_fila": 5, "max_columna": 3},
            headers=headers,
        )
        assert r.status_code == 201, r.text
        return r.json()

    def test_alta_componentes_nuevos(self, client, admin_headers):
        cat = self._crear_categoria(client, admin_headers, "CAT_Martillo")
        dep = self._crear_deposito(client, admin_headers, "Deposito Central")
        payload = {
            "articulo": {"nombre": "Martillo", "categoria_id": cat["id"]},
            "medida": {"unidad_medida": "unidad", "medida": "unidad"},
            "espacio": {"deposito_id": dep["id"], "tipo": "estanteria", "max_fila": 5, "max_columna": 3},
            "fila": 1,
            "columna": 2,
            "stock": 4,
            "precio_venta": 12.5,
        }
        r = client.post("/api/v1/inventarios/alta", json=payload, headers=admin_headers)
        assert r.status_code == 201, r.text
        body = r.json()
        assert body["stock"] == 4
        assert body["fila"] == 1
        assert body["columna"] == 2
        assert body["espacio_id"] is not None
        assert float(body["precio_venta"]) == 12.5
        assert any(a["nombre"] == "Martillo" for a in client.get("/api/v1/articulos", headers=admin_headers).json())
        assert any(
            m["unidad_medida"] == "unidad" and m["medida"] == "unidad"
            for m in client.get("/api/v1/medidas", headers=admin_headers).json()
        )
        assert any(e["tipo"] == "estanteria" for e in client.get("/api/v1/espacios", headers=admin_headers).json())
        dep_actualizado = client.get(f"/api/v1/depositos/{dep['id']}", headers=admin_headers).json()
        assert dep_actualizado["cantidad_espacios"] == 1

    def test_alta_componentes_existentes(self, client, admin_headers):
        articulo = self._crear_articulo(client, admin_headers)
        medida = self._crear_medida(client, admin_headers)
        dep = self._crear_deposito(client, admin_headers, "Deposito Central")
        espacio = self._crear_espacio(client, admin_headers, dep["id"])
        payload = {
            "articulo": {"id": articulo["id"]},
            "medida": {"id": medida["id"]},
            "espacio": {"id": espacio["id"]},
            "fila": 2,
            "columna": 1,
            "stock": 3,
            "precio_venta": 9.9,
        }
        r = client.post("/api/v1/inventarios/alta", json=payload, headers=admin_headers)
        assert r.status_code == 201, r.text
        body = r.json()
        assert body["articulo_id"] == articulo["id"]
        assert body["medida_id"] == medida["id"]
        assert body["espacio_id"] == espacio["id"]
        assert len(client.get("/api/v1/articulos", headers=admin_headers).json()) == 1
        assert len(client.get("/api/v1/espacios", headers=admin_headers).json()) == 1

    def test_alta_sin_stock_sin_espacio(self, client, admin_headers):
        cat = self._crear_categoria(client, admin_headers, "CAT_Martillo")
        payload = {
            "articulo": {"nombre": "Martillo", "categoria_id": cat["id"]},
            "medida": {"unidad_medida": "unidad", "medida": "unidad"},
            "precio_venta": 10,
        }
        r = client.post("/api/v1/inventarios/alta", json=payload, headers=admin_headers)
        assert r.status_code == 201, r.text
        body = r.json()
        assert body["stock"] == 0
        assert body["espacio_id"] is None
        assert body["fila"] is None
        assert body["columna"] is None

    def test_alta_combinacion_duplicada_rollback(self, client, admin_headers):
        articulo = self._crear_articulo(client, admin_headers)
        medida = self._crear_medida(client, admin_headers)
        payload = {"articulo": {"id": articulo["id"]}, "medida": {"id": medida["id"]}, "precio_venta": 10}
        r = client.post("/api/v1/inventarios/alta", json=payload, headers=admin_headers)
        assert r.status_code == 201, r.text
        dep = self._crear_deposito(client, admin_headers, "Deposito Central")
        payload2 = {
            "articulo": {"id": articulo["id"]},
            "medida": {"id": medida["id"]},
            "espacio": {"deposito_id": dep["id"], "max_fila": 5, "max_columna": 3},
            "fila": 1,
            "columna": 1,
            "stock": 1,
            "precio_venta": 10,
        }
        r2 = client.post("/api/v1/inventarios/alta", json=payload2, headers=admin_headers)
        assert r2.status_code == 409
        assert client.get("/api/v1/espacios", headers=admin_headers).json() == []
        assert len(client.get("/api/v1/inventarios", headers=admin_headers).json()) == 1

    def test_alta_articulo_duplicado_rollback(self, client, admin_headers):
        articulo = self._crear_articulo(client, admin_headers, "Martillo")
        dep = self._crear_deposito(client, admin_headers, "Deposito Central")
        payload = {
            "articulo": {"nombre": "Martillo", "categoria_id": articulo["categoria_id"]},
            "medida": {"unidad_medida": "unidad", "medida": "unidad"},
            "espacio": {"deposito_id": dep["id"], "max_fila": 5, "max_columna": 3},
            "fila": 1,
            "columna": 1,
            "stock": 1,
            "precio_venta": 10,
        }
        r = client.post("/api/v1/inventarios/alta", json=payload, headers=admin_headers)
        assert r.status_code == 409
        assert client.get("/api/v1/medidas", headers=admin_headers).json() == []
        assert client.get("/api/v1/espacios", headers=admin_headers).json() == []
        assert client.get("/api/v1/inventarios", headers=admin_headers).json() == []

    def test_alta_medida_duplicada_rollback(self, client, admin_headers):
        self._crear_medida(client, admin_headers)
        cat = self._crear_categoria(client, admin_headers, "CAT_Martillo")
        dep = self._crear_deposito(client, admin_headers, "Deposito Central")
        payload = {
            "articulo": {"nombre": "Martillo", "categoria_id": cat["id"]},
            "medida": {"unidad_medida": "unidad", "medida": "unidad"},
            "espacio": {"deposito_id": dep["id"], "max_fila": 5, "max_columna": 3},
            "fila": 1,
            "columna": 1,
            "stock": 1,
            "precio_venta": 10,
        }
        r = client.post("/api/v1/inventarios/alta", json=payload, headers=admin_headers)
        assert r.status_code == 409
        assert all(
            a["nombre"] != "Martillo" for a in client.get("/api/v1/articulos", headers=admin_headers).json()
        )
        assert client.get("/api/v1/espacios", headers=admin_headers).json() == []
        assert client.get("/api/v1/inventarios", headers=admin_headers).json() == []

    def test_alta_espacio_deposito_inexistente_rollback(self, client, admin_headers):
        cat = self._crear_categoria(client, admin_headers, "CAT_Martillo")
        payload = {
            "articulo": {"nombre": "Martillo", "categoria_id": cat["id"]},
            "medida": {"unidad_medida": "unidad", "medida": "unidad"},
            "espacio": {
                "deposito_id": "00000000-0000-0000-0000-000000000000",
                "max_fila": 5,
                "max_columna": 3,
            },
            "fila": 1,
            "columna": 1,
            "stock": 1,
            "precio_venta": 10,
        }
        r = client.post("/api/v1/inventarios/alta", json=payload, headers=admin_headers)
        assert r.status_code == 400
        assert all(
            a["nombre"] != "Martillo" for a in client.get("/api/v1/articulos", headers=admin_headers).json()
        )
        assert client.get("/api/v1/medidas", headers=admin_headers).json() == []
        assert client.get("/api/v1/inventarios", headers=admin_headers).json() == []

    def test_alta_precio_negativo(self, client, admin_headers):
        cat = self._crear_categoria(client, admin_headers, "CAT_Martillo")
        payload = {
            "articulo": {"nombre": "Martillo", "categoria_id": cat["id"]},
            "medida": {"unidad_medida": "unidad", "medida": "unidad"},
            "precio_venta": -1,
        }
        r = client.post("/api/v1/inventarios/alta", json=payload, headers=admin_headers)
        assert r.status_code == 422
        assert client.get("/api/v1/inventarios", headers=admin_headers).json() == []

    def test_alta_stock_sin_espacio(self, client, admin_headers):
        cat = self._crear_categoria(client, admin_headers, "CAT_Martillo")
        payload = {
            "articulo": {"nombre": "Martillo", "categoria_id": cat["id"]},
            "medida": {"unidad_medida": "unidad", "medida": "unidad"},
            "stock": 5,
            "precio_venta": 10,
        }
        r = client.post("/api/v1/inventarios/alta", json=payload, headers=admin_headers)
        assert r.status_code == 422
        assert client.get("/api/v1/articulos", headers=admin_headers).json() == []
        assert client.get("/api/v1/medidas", headers=admin_headers).json() == []
        assert client.get("/api/v1/inventarios", headers=admin_headers).json() == []
