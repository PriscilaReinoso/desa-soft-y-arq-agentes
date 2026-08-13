class TestInventarioCrud:
    def _crear_categoria(self, client, headers, nombre="HERRAMIENTAS"):
        r = client.post("/api/v1/categorias", json={"nombre": nombre}, headers=headers)
        assert r.status_code == 201, r.text
        return r.json()

    def _crear_articulo(self, client, headers, nombre="Martillo"):
        cat = self._crear_categoria(client, headers, nombre=f"CAT_{nombre}")
        r = client.post("/api/v1/articulos", json={"nombre": nombre, "categoria_id": cat["id"]}, headers=headers)
        assert r.status_code == 201, r.text
        return r.json()

    def _crear_medida(self, client, headers, unidad="unidad", medida="unidad"):
        r = client.post("/api/v1/medidas", json={"unidad_medida": unidad, "medida": medida}, headers=headers)
        assert r.status_code == 201, r.text
        return r.json()

    def _crear_deposito(self, client, headers, nombre="Deposito Central"):
        r = client.post("/api/v1/depositos", json={"nombre": nombre}, headers=headers)
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

    def _crear_inventario(
        self,
        client,
        headers,
        articulo_id,
        medida_id,
        espacio_id=None,
        fila=None,
        columna=None,
        stock=0,
        precio=10.5,
    ):
        payload = {"articulo_id": articulo_id, "medida_id": medida_id, "precio_venta": precio}
        if espacio_id is not None:
            payload.update({"espacio_id": espacio_id, "fila": fila, "columna": columna})
        if stock != 0:
            payload["stock"] = stock
        return client.post("/api/v1/inventarios", json=payload, headers=headers)

    def _crear_inventario_con_ubicacion(self, client, headers):
        articulo = self._crear_articulo(client, headers)
        medida = self._crear_medida(client, headers)
        dep = self._crear_deposito(client, headers)
        espacio = self._crear_espacio(client, headers, dep["id"])
        return articulo, medida, espacio

    def test_crear_inventario_con_ubicacion(self, client, admin_headers):
        articulo, medida, espacio = self._crear_inventario_con_ubicacion(client, admin_headers)
        r = self._crear_inventario(
            client, admin_headers, articulo["id"], medida["id"], espacio["id"], fila=2, columna=3, stock=5
        )
        assert r.status_code == 201, r.text
        body = r.json()
        assert body["articulo"]["id"] == articulo["id"]
        assert body["medida"]["id"] == medida["id"]
        assert body["espacio"]["id"] == espacio["id"]
        assert body["fila"] == 2
        assert body["columna"] == 3
        assert body["stock"] == 5
        assert float(body["precio_venta"]) == 10.5
        assert "articulo_id" not in body
        assert "medida_id" not in body
        assert "espacio_id" not in body
        assert body["articulo"]["categoria"]["id"] == articulo["categoria_id"]
        assert body["medida"]["id"] == medida["id"]
        assert body["medida"]["unidad_medida"] == "unidad"
        assert body["espacio"]["id"] == espacio["id"]
        assert body["espacio"]["deposito"]["id"] == body["espacio"]["deposito_id"]

    def test_crear_inventario_sin_ubicacion_sin_stock(self, client, admin_headers):
        articulo = self._crear_articulo(client, admin_headers)
        medida = self._crear_medida(client, admin_headers)
        r = self._crear_inventario(client, admin_headers, articulo["id"], medida["id"])
        assert r.status_code == 201, r.text
        body = r.json()
        assert body["espacio"] is None
        assert body["stock"] == 0

    def test_crear_combinacion_duplicada(self, client, admin_headers):
        articulo = self._crear_articulo(client, admin_headers)
        medida = self._crear_medida(client, admin_headers)
        self._crear_inventario(client, admin_headers, articulo["id"], medida["id"])
        r = self._crear_inventario(client, admin_headers, articulo["id"], medida["id"])
        assert r.status_code == 409

    def test_crear_stock_negativo(self, client, admin_headers):
        articulo = self._crear_articulo(client, admin_headers)
        medida = self._crear_medida(client, admin_headers)
        r = client.post(
            "/api/v1/inventarios",
            json={"articulo_id": articulo["id"], "medida_id": medida["id"], "stock": -1, "precio_venta": 10},
            headers=admin_headers,
        )
        assert r.status_code == 422

    def test_crear_precio_negativo(self, client, admin_headers):
        articulo = self._crear_articulo(client, admin_headers)
        medida = self._crear_medida(client, admin_headers)
        r = client.post(
            "/api/v1/inventarios",
            json={"articulo_id": articulo["id"], "medida_id": medida["id"], "precio_venta": -1},
            headers=admin_headers,
        )
        assert r.status_code == 422

    def test_crear_fila_negativa(self, client, admin_headers):
        articulo = self._crear_articulo(client, admin_headers)
        medida = self._crear_medida(client, admin_headers)
        dep = self._crear_deposito(client, admin_headers)
        espacio = self._crear_espacio(client, admin_headers, dep["id"])
        r = client.post(
            "/api/v1/inventarios",
            json={
                "articulo_id": articulo["id"],
                "medida_id": medida["id"],
                "espacio_id": espacio["id"],
                "fila": -1,
                "columna": 1,
                "stock": 1,
                "precio_venta": 10,
            },
            headers=admin_headers,
        )
        assert r.status_code == 422

    def test_crear_stock_positivo_sin_espacio(self, client, admin_headers):
        articulo = self._crear_articulo(client, admin_headers)
        medida = self._crear_medida(client, admin_headers)
        r = client.post(
            "/api/v1/inventarios",
            json={"articulo_id": articulo["id"], "medida_id": medida["id"], "stock": 5, "precio_venta": 10},
            headers=admin_headers,
        )
        assert r.status_code == 422

    def test_crear_articulo_inexistente(self, client, admin_headers):
        medida = self._crear_medida(client, admin_headers)
        r = client.post(
            "/api/v1/inventarios",
            json={
                "articulo_id": "00000000-0000-0000-0000-000000000000",
                "medida_id": medida["id"],
                "precio_venta": 10,
            },
            headers=admin_headers,
        )
        assert r.status_code == 400

    def test_crear_medida_inexistente(self, client, admin_headers):
        articulo = self._crear_articulo(client, admin_headers)
        r = client.post(
            "/api/v1/inventarios",
            json={
                "articulo_id": articulo["id"],
                "medida_id": "00000000-0000-0000-0000-000000000000",
                "precio_venta": 10,
            },
            headers=admin_headers,
        )
        assert r.status_code == 400

    def test_listar_inventarios(self, client, admin_headers):
        articulo, medida, espacio = self._crear_inventario_con_ubicacion(client, admin_headers)
        self._crear_inventario(
            client, admin_headers, articulo["id"], medida["id"], espacio["id"], fila=1, columna=1, stock=2
        )
        articulo2 = self._crear_articulo(client, admin_headers, nombre="Serrucho")
        medida2 = self._crear_medida(client, admin_headers, unidad="metro", medida="metro")
        self._crear_inventario(client, admin_headers, articulo2["id"], medida2["id"])
        r = client.get("/api/v1/inventarios", headers=admin_headers)
        assert r.status_code == 200
        body = r.json()
        assert len(body) == 2
        con_ubicacion = next(item for item in body if item["espacio"] is not None)
        assert con_ubicacion["articulo"]["id"] == articulo["id"]
        assert con_ubicacion["articulo"]["categoria"]["id"] == articulo["categoria_id"]
        assert con_ubicacion["medida"]["id"] == medida["id"]
        assert con_ubicacion["espacio"]["id"] == espacio["id"]
        assert con_ubicacion["espacio"]["deposito"]["id"] == espacio["deposito_id"]
        assert all(item["articulo"] is not None and item["medida"] is not None for item in body)

    def test_obtener_inventario_por_id(self, client, admin_headers):
        articulo, medida, espacio = self._crear_inventario_con_ubicacion(client, admin_headers)
        creado = self._crear_inventario(
            client, admin_headers, articulo["id"], medida["id"], espacio["id"], fila=2, columna=2, stock=3
        ).json()
        r = client.get(f"/api/v1/inventarios/{creado['id']}", headers=admin_headers)
        assert r.status_code == 200
        body = r.json()
        assert body["stock"] == 3
        assert body["articulo"]["id"] == articulo["id"]
        assert body["articulo"]["categoria"]["id"] == articulo["categoria_id"]
        assert body["medida"]["id"] == medida["id"]
        assert body["espacio"]["id"] == espacio["id"]
        assert body["espacio"]["deposito"]["id"] == espacio["deposito_id"]

    def test_obtener_inventario_inexistente(self, client, admin_headers):
        r = client.get("/api/v1/inventarios/00000000-0000-0000-0000-000000000000", headers=admin_headers)
        assert r.status_code == 404

    def test_actualizar_inventario(self, client, admin_headers):
        articulo, medida, espacio = self._crear_inventario_con_ubicacion(client, admin_headers)
        creado = self._crear_inventario(
            client, admin_headers, articulo["id"], medida["id"], espacio["id"], fila=1, columna=1, stock=1
        ).json()
        r = client.put(
            f"/api/v1/inventarios/{creado['id']}",
            json={"stock": 8, "precio_venta": 15},
            headers=admin_headers,
        )
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["stock"] == 8
        assert float(body["precio_venta"]) == 15

    def test_actualizar_inventario_inexistente(self, client, admin_headers):
        r = client.put(
            "/api/v1/inventarios/00000000-0000-0000-0000-000000000000",
            json={"stock": 1},
            headers=admin_headers,
        )
        assert r.status_code == 404

    def test_actualizar_stock_negativo(self, client, admin_headers):
        articulo = self._crear_articulo(client, admin_headers)
        medida = self._crear_medida(client, admin_headers)
        creado = self._crear_inventario(client, admin_headers, articulo["id"], medida["id"]).json()
        r = client.put(
            f"/api/v1/inventarios/{creado['id']}",
            json={"stock": -3},
            headers=admin_headers,
        )
        assert r.status_code == 422

    def test_actualizar_stock_positivo_sin_espacio(self, client, admin_headers):
        articulo = self._crear_articulo(client, admin_headers)
        medida = self._crear_medida(client, admin_headers)
        creado = self._crear_inventario(client, admin_headers, articulo["id"], medida["id"]).json()
        r = client.put(
            f"/api/v1/inventarios/{creado['id']}",
            json={"stock": 5, "espacio_id": None},
            headers=admin_headers,
        )
        assert r.status_code == 422

    def test_eliminar_inventario_baja_logica(self, client, admin_headers):
        articulo = self._crear_articulo(client, admin_headers)
        medida = self._crear_medida(client, admin_headers)
        creado = self._crear_inventario(client, admin_headers, articulo["id"], medida["id"]).json()
        r = client.delete(f"/api/v1/inventarios/{creado['id']}", headers=admin_headers)
        assert r.status_code == 204
        assert client.get(f"/api/v1/inventarios/{creado['id']}", headers=admin_headers).status_code == 404
        assert client.get("/api/v1/inventarios", headers=admin_headers).json() == []
