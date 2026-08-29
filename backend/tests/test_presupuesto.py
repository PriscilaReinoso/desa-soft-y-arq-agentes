import uuid


class TestPresupuesto:
    def _crear_categoria(self, client, headers, nombre="HERRAMIENTAS"):
        r = client.post("/api/v1/categorias", json={"nombre": nombre}, headers=headers)
        assert r.status_code == 201, r.text
        return r.json()

    def _crear_inventario(self, client, headers, stock=10, precio=10.5):
        cat = self._crear_categoria(client, headers)
        articulo = client.post(
            "/api/v1/articulos", json={"nombre": f"Articulo_{uuid.uuid4().hex[:6]}", "categoria_id": cat["id"]},
            headers=headers,
        )
        assert articulo.status_code == 201, articulo.text
        articulo = articulo.json()
        medida = client.post(
            "/api/v1/medidas", json={"unidad_medida": "unidad", "medida": "unidad"}, headers=headers
        ).json()
        deposito = client.post(
            "/api/v1/depositos", json={"nombre": f"Dep_{uuid.uuid4().hex[:6]}"}, headers=headers
        ).json()
        espacio = client.post(
            "/api/v1/espacios",
            json={"deposito_id": deposito["id"], "tipo": "estanteria", "max_fila": 5, "max_columna": 3},
            headers=headers,
        ).json()
        inventario = client.post(
            "/api/v1/inventarios",
            json={
                "articulo_id": articulo["id"],
                "medida_id": medida["id"],
                "espacio_id": espacio["id"],
                "fila": 1,
                "columna": 1,
                "stock": stock,
                "precio_venta": precio,
            },
            headers=headers,
        )
        assert inventario.status_code == 201, inventario.text
        return inventario.json()

    def test_crear_presupuesto(self, client, admin_headers):
        inventario = self._crear_inventario(client, admin_headers, stock=10, precio=10.5)
        r = client.post(
            "/api/v1/presupuestos",
            json={"items": [{"inventario_id": inventario["id"], "cantidad": 2}]},
            headers=admin_headers,
        )
        assert r.status_code == 201, r.text
        body = r.json()
        assert body["numero"] == 1
        assert float(body["cantidad"]) == 2.0
        assert float(body["total"]) == 21.0
        assert body["aprobado"] is False
        assert len(body["detalles"]) == 1
        detalle = body["detalles"][0]
        assert detalle["articulo"]["id"] == inventario["articulo"]["id"]
        assert detalle["medida"]["id"] == inventario["medida"]["id"]
        assert float(detalle["cantidad"]) == 2.0
        assert float(detalle["precio_venta"]) == 10.5
        assert float(detalle["sub_total"]) == 21.0

    def test_numero_autoincremental(self, client, admin_headers):
        inventario = self._crear_inventario(client, admin_headers)
        for numero in (1, 2, 3):
            r = client.post(
                "/api/v1/presupuestos",
                json={"items": [{"inventario_id": inventario["id"], "cantidad": 1}]},
                headers=admin_headers,
            )
            assert r.status_code == 201, r.text
            assert r.json()["numero"] == numero

    def test_inventario_inexistente(self, client, admin_headers):
        r = client.post(
            "/api/v1/presupuestos",
            json={"items": [{"inventario_id": str(uuid.uuid4()), "cantidad": 1}]},
            headers=admin_headers,
        )
        assert r.status_code == 400

    def test_cantidad_no_positiva(self, client, admin_headers):
        inventario = self._crear_inventario(client, admin_headers)
        r = client.post(
            "/api/v1/presupuestos",
            json={"items": [{"inventario_id": inventario["id"], "cantidad": 0}]},
            headers=admin_headers,
        )
        assert r.status_code == 422

    def test_cantidad_decimal_rechazada(self, client, admin_headers):
        inventario = self._crear_inventario(client, admin_headers)
        r = client.post(
            "/api/v1/presupuestos",
            json={"items": [{"inventario_id": inventario["id"], "cantidad": 1.5}]},
            headers=admin_headers,
        )
        assert r.status_code == 422

    def test_items_vacios(self, client, admin_headers):
        r = client.post("/api/v1/presupuestos", json={"items": []}, headers=admin_headers)
        assert r.status_code == 422

    def test_obtener_por_id_y_por_numero(self, client, admin_headers):
        inventario = self._crear_inventario(client, admin_headers)
        creado = client.post(
            "/api/v1/presupuestos",
            json={"items": [{"inventario_id": inventario["id"], "cantidad": 1}], "cliente": "Juan"},
            headers=admin_headers,
        ).json()
        r = client.get(f"/api/v1/presupuestos/{creado['id']}", headers=admin_headers)
        assert r.status_code == 200
        assert r.json()["cliente"] == "Juan"
        assert len(r.json()["detalles"]) == 1
        r = client.get(f"/api/v1/presupuestos/{creado['numero']}", headers=admin_headers)
        assert r.status_code == 200
        assert r.json()["id"] == creado["id"]

    def test_obtener_inexistente(self, client, admin_headers):
        r = client.get(f"/api/v1/presupuestos/{uuid.uuid4()}", headers=admin_headers)
        assert r.status_code == 404
        assert client.get("/api/v1/presupuestos/999", headers=admin_headers).status_code == 404

    def test_listar_presupuestos(self, client, admin_headers):
        inventario = self._crear_inventario(client, admin_headers)
        client.post(
            "/api/v1/presupuestos",
            json={"items": [{"inventario_id": inventario["id"], "cantidad": 1}]},
            headers=admin_headers,
        )
        r = client.get("/api/v1/presupuestos", headers=admin_headers)
        assert r.status_code == 200
        body = r.json()
        assert len(body) == 1
        assert len(body[0]["detalles"]) == 1

    def test_listar_excluye_eliminados(self, client, admin_headers):
        inventario = self._crear_inventario(client, admin_headers)
        creado = client.post(
            "/api/v1/presupuestos",
            json={"items": [{"inventario_id": inventario["id"], "cantidad": 1}]},
            headers=admin_headers,
        ).json()
        client.delete(f"/api/v1/presupuestos/{creado['id']}", headers=admin_headers)
        r = client.get("/api/v1/presupuestos", headers=admin_headers)
        assert r.status_code == 200
        assert r.json() == []

    def test_actualizar_presupuesto(self, client, admin_headers):
        inventario = self._crear_inventario(client, admin_headers, stock=10, precio=10.5)
        creado = client.post(
            "/api/v1/presupuestos",
            json={"items": [{"inventario_id": inventario["id"], "cantidad": 2}]},
            headers=admin_headers,
        ).json()
        r = client.put(
            f"/api/v1/presupuestos/{creado['id']}",
            json={"items": [{"inventario_id": inventario["id"], "cantidad": 4}], "cliente": "Ana"},
            headers=admin_headers,
        )
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["cliente"] == "Ana"
        assert float(body["cantidad"]) == 4.0
        assert float(body["total"]) == 42.0
        assert len(body["detalles"]) == 1

    def test_actualizar_inexistente(self, client, admin_headers):
        r = client.put(
            f"/api/v1/presupuestos/{uuid.uuid4()}",
            json={"cliente": "Ana"},
            headers=admin_headers,
        )
        assert r.status_code == 404

    def test_eliminar_baja_logica(self, client, admin_headers):
        inventario = self._crear_inventario(client, admin_headers)
        creado = client.post(
            "/api/v1/presupuestos",
            json={"items": [{"inventario_id": inventario["id"], "cantidad": 1}]},
            headers=admin_headers,
        ).json()
        r = client.delete(f"/api/v1/presupuestos/{creado['id']}", headers=admin_headers)
        assert r.status_code == 204
        assert client.get(f"/api/v1/presupuestos/{creado['id']}", headers=admin_headers).status_code == 404

    def test_pdf_presupuesto(self, client, admin_headers):
        inventario = self._crear_inventario(client, admin_headers)
        creado = client.post(
            "/api/v1/presupuestos",
            json={"items": [{"inventario_id": inventario["id"], "cantidad": 2}]},
            headers=admin_headers,
        ).json()
        r = client.get(f"/api/v1/presupuestos/{creado['numero']}/pdf", headers=admin_headers)
        assert r.status_code == 200
        assert r.headers["content-type"] == "application/pdf"
        assert r.content.startswith(b"%PDF")

    def test_pdf_presupuesto_inexistente(self, client, admin_headers):
        r = client.get("/api/v1/presupuestos/999/pdf", headers=admin_headers)
        assert r.status_code == 404
