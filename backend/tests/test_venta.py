import uuid
from datetime import timedelta

from app.core.database import utcnow
from app.models.venta import VentaCabecera


class TestVenta:
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

    def _get_stock(self, client, headers, inventario_id):
        r = client.get(f"/api/v1/inventarios/{inventario_id}", headers=headers)
        assert r.status_code == 200, r.text
        return r.json()["stock"]

    def _crear_presupuesto(self, client, headers, inventario_id):
        r = client.post(
            "/api/v1/presupuestos",
            json={"items": [{"inventario_id": inventario_id, "cantidad": 1}]},
            headers=headers,
        )
        assert r.status_code == 201, r.text
        return r.json()

    def _set_venta_fecha(self, db_session, venta_id, dias):
        venta = db_session.get(VentaCabecera, uuid.UUID(venta_id))
        venta.fecha = utcnow() - timedelta(days=dias)
        db_session.commit()

    def test_crear_sin_aprobacion_no_descuenta_stock(self, client, admin_headers):
        inventario = self._crear_inventario(client, admin_headers, stock=10, precio=10.5)
        r = client.post(
            "/api/v1/ventas",
            json={"items": [{"inventario_id": inventario["id"], "cantidad": 2}]},
            headers=admin_headers,
        )
        assert r.status_code == 201, r.text
        body = r.json()
        assert body["numero"] == 1
        assert body["aprobado"] is False
        assert float(body["cantidad"]) == 2.0
        assert float(body["total"]) == 21.0
        assert len(body["detalles"]) == 1
        detalle = body["detalles"][0]
        assert detalle["articulo"]["id"] == inventario["articulo"]["id"]
        assert float(detalle["sub_total"]) == 21.0
        assert self._get_stock(client, admin_headers, inventario["id"]) == 10

    def test_crear_aprobada_si_descuenta_stock(self, client, admin_headers):
        inventario = self._crear_inventario(client, admin_headers, stock=10, precio=10.5)
        r = client.post(
            "/api/v1/ventas",
            json={"items": [{"inventario_id": inventario["id"], "cantidad": 2}], "aprobado": True},
            headers=admin_headers,
        )
        assert r.status_code == 201, r.text
        assert r.json()["aprobado"] is True
        assert self._get_stock(client, admin_headers, inventario["id"]) == 8

    def test_crear_aprobado_default(self, client, admin_headers):
        inventario = self._crear_inventario(client, admin_headers)
        r = client.post(
            "/api/v1/ventas",
            json={"items": [{"inventario_id": inventario["id"], "cantidad": 1}]},
            headers=admin_headers,
        )
        assert r.status_code == 201, r.text
        assert r.json()["aprobado"] is False

    def test_numero_autoincremental(self, client, admin_headers):
        inventario = self._crear_inventario(client, admin_headers)
        for numero in (1, 2):
            r = client.post(
                "/api/v1/ventas",
                json={"items": [{"inventario_id": inventario["id"], "cantidad": 1}]},
                headers=admin_headers,
            )
            assert r.status_code == 201, r.text
            assert r.json()["numero"] == numero

    def test_inventario_inexistente(self, client, admin_headers):
        r = client.post(
            "/api/v1/ventas",
            json={"items": [{"inventario_id": str(uuid.uuid4()), "cantidad": 1}]},
            headers=admin_headers,
        )
        assert r.status_code == 400

    def test_cantidad_no_positiva(self, client, admin_headers):
        inventario = self._crear_inventario(client, admin_headers)
        r = client.post(
            "/api/v1/ventas",
            json={"items": [{"inventario_id": inventario["id"], "cantidad": 0}]},
            headers=admin_headers,
        )
        assert r.status_code == 422

    def test_cantidad_decimal_rechazada(self, client, admin_headers):
        inventario = self._crear_inventario(client, admin_headers)
        r = client.post(
            "/api/v1/ventas",
            json={"items": [{"inventario_id": inventario["id"], "cantidad": 1.5}]},
            headers=admin_headers,
        )
        assert r.status_code == 422
        assert self._get_stock(client, admin_headers, inventario["id"]) == 10

    def test_stock_insuficiente(self, client, admin_headers):
        inventario = self._crear_inventario(client, admin_headers, stock=3)
        r = client.post(
            "/api/v1/ventas",
            json={"items": [{"inventario_id": inventario["id"], "cantidad": 4}]},
            headers=admin_headers,
        )
        assert r.status_code == 422
        assert self._get_stock(client, admin_headers, inventario["id"]) == 3

    def test_items_vacios(self, client, admin_headers):
        r = client.post("/api/v1/ventas", json={"items": []}, headers=admin_headers)
        assert r.status_code == 422

    def test_crear_venta_con_presupuesto(self, client, admin_headers):
        inventario = self._crear_inventario(client, admin_headers, stock=10, precio=10.5)
        presupuesto = self._crear_presupuesto(client, admin_headers, inventario["id"])
        r = client.post(
            "/api/v1/ventas",
            json={
                "items": [{"inventario_id": inventario["id"], "cantidad": 1}],
                "presupuesto_id": presupuesto["id"],
            },
            headers=admin_headers,
        )
        assert r.status_code == 201, r.text
        body = r.json()
        assert body["presupuesto_id"] == presupuesto["id"]
        assert "presupuesto_id" not in body["detalles"][0]

    def test_crear_venta_presupuesto_inexistente(self, client, admin_headers):
        inventario = self._crear_inventario(client, admin_headers)
        r = client.post(
            "/api/v1/ventas",
            json={
                "items": [{"inventario_id": inventario["id"], "cantidad": 1}],
                "presupuesto_id": str(uuid.uuid4()),
            },
            headers=admin_headers,
        )
        assert r.status_code == 400

    def test_obtener_por_id_y_por_numero(self, client, admin_headers):
        inventario = self._crear_inventario(client, admin_headers)
        creado = client.post(
            "/api/v1/ventas",
            json={"items": [{"inventario_id": inventario["id"], "cantidad": 1}], "cliente": "Juan"},
            headers=admin_headers,
        ).json()
        r = client.get(f"/api/v1/ventas/{creado['id']}", headers=admin_headers)
        assert r.status_code == 200
        assert r.json()["cliente"] == "Juan"
        assert len(r.json()["detalles"]) == 1
        r = client.get(f"/api/v1/ventas/{creado['numero']}", headers=admin_headers)
        assert r.status_code == 200
        assert r.json()["id"] == creado["id"]

    def test_obtener_inexistente(self, client, admin_headers):
        assert client.get(f"/api/v1/ventas/{uuid.uuid4()}", headers=admin_headers).status_code == 404
        assert client.get("/api/v1/ventas/999", headers=admin_headers).status_code == 404

    def test_listar_ventas(self, client, admin_headers):
        inventario = self._crear_inventario(client, admin_headers)
        client.post(
            "/api/v1/ventas",
            json={"items": [{"inventario_id": inventario["id"], "cantidad": 1}]},
            headers=admin_headers,
        )
        r = client.get("/api/v1/ventas", headers=admin_headers)
        assert r.status_code == 200
        body = r.json()
        assert len(body) == 1
        assert len(body[0]["detalles"]) == 1

    def test_listar_excluye_eliminadas(self, client, admin_headers):
        inventario = self._crear_inventario(client, admin_headers)
        creado = client.post(
            "/api/v1/ventas",
            json={"items": [{"inventario_id": inventario["id"], "cantidad": 1}]},
            headers=admin_headers,
        ).json()
        client.delete(f"/api/v1/ventas/{creado['id']}", headers=admin_headers)
        r = client.get("/api/v1/ventas", headers=admin_headers)
        assert r.status_code == 200
        assert r.json() == []

    def test_aprobar_venta_descuenta_stock(self, client, admin_headers):
        inventario = self._crear_inventario(client, admin_headers, stock=10, precio=10.5)
        creado = client.post(
            "/api/v1/ventas",
            json={"items": [{"inventario_id": inventario["id"], "cantidad": 2}]},
            headers=admin_headers,
        ).json()
        assert self._get_stock(client, admin_headers, inventario["id"]) == 10
        r = client.put(
            f"/api/v1/ventas/{creado['id']}",
            json={"aprobado": True},
            headers=admin_headers,
        )
        assert r.status_code == 200, r.text
        assert r.json()["aprobado"] is True
        assert self._get_stock(client, admin_headers, inventario["id"]) == 8

    def test_aprobar_sin_stock_suficiente(self, client, admin_headers):
        inventario = self._crear_inventario(client, admin_headers, stock=10)
        creado = client.post(
            "/api/v1/ventas",
            json={"items": [{"inventario_id": inventario["id"], "cantidad": 5}]},
            headers=admin_headers,
        ).json()
        client.post(
            "/api/v1/ventas",
            json={"items": [{"inventario_id": inventario["id"], "cantidad": 8}], "aprobado": True},
            headers=admin_headers,
        )
        assert self._get_stock(client, admin_headers, inventario["id"]) == 2
        r = client.put(
            f"/api/v1/ventas/{creado['id']}",
            json={"aprobado": True},
            headers=admin_headers,
        )
        assert r.status_code == 422
        assert self._get_stock(client, admin_headers, inventario["id"]) == 2

    def test_desaprobar_venta_restaura_stock(self, client, admin_headers):
        inventario = self._crear_inventario(client, admin_headers, stock=10, precio=10.5)
        creado = client.post(
            "/api/v1/ventas",
            json={"items": [{"inventario_id": inventario["id"], "cantidad": 2}], "aprobado": True},
            headers=admin_headers,
        ).json()
        assert self._get_stock(client, admin_headers, inventario["id"]) == 8
        r = client.put(
            f"/api/v1/ventas/{creado['id']}",
            json={"aprobado": False},
            headers=admin_headers,
        )
        assert r.status_code == 200, r.text
        assert r.json()["aprobado"] is False
        assert self._get_stock(client, admin_headers, inventario["id"]) == 10

    def test_desaprobar_venta_fuera_de_plazo(self, client, admin_headers, db_session):
        inventario = self._crear_inventario(client, admin_headers, stock=10, precio=10.5)
        creado = client.post(
            "/api/v1/ventas",
            json={"items": [{"inventario_id": inventario["id"], "cantidad": 2}], "aprobado": True},
            headers=admin_headers,
        ).json()
        assert self._get_stock(client, admin_headers, inventario["id"]) == 8
        self._set_venta_fecha(db_session, creado["id"], dias=8)
        r = client.put(
            f"/api/v1/ventas/{creado['id']}",
            json={"aprobado": False},
            headers=admin_headers,
        )
        assert r.status_code == 400
        assert self._get_stock(client, admin_headers, inventario["id"]) == 8

    def test_actualizar_items_venta_aprobada(self, client, admin_headers):
        inventario = self._crear_inventario(client, admin_headers, stock=10, precio=10.5)
        creado = client.post(
            "/api/v1/ventas",
            json={"items": [{"inventario_id": inventario["id"], "cantidad": 2}], "aprobado": True},
            headers=admin_headers,
        ).json()
        assert self._get_stock(client, admin_headers, inventario["id"]) == 8
        r = client.put(
            f"/api/v1/ventas/{creado['id']}",
            json={"items": [{"inventario_id": inventario["id"], "cantidad": 3}]},
            headers=admin_headers,
        )
        assert r.status_code == 200, r.text
        body = r.json()
        assert float(body["cantidad"]) == 3.0
        assert float(body["total"]) == 31.5
        assert self._get_stock(client, admin_headers, inventario["id"]) == 7

    def test_actualizar_items_venta_no_aprobada(self, client, admin_headers):
        inventario = self._crear_inventario(client, admin_headers, stock=10, precio=10.5)
        creado = client.post(
            "/api/v1/ventas",
            json={"items": [{"inventario_id": inventario["id"], "cantidad": 2}]},
            headers=admin_headers,
        ).json()
        assert self._get_stock(client, admin_headers, inventario["id"]) == 10
        r = client.put(
            f"/api/v1/ventas/{creado['id']}",
            json={"items": [{"inventario_id": inventario["id"], "cantidad": 5}]},
            headers=admin_headers,
        )
        assert r.status_code == 200, r.text
        assert float(r.json()["cantidad"]) == 5.0
        assert self._get_stock(client, admin_headers, inventario["id"]) == 10

    def test_actualizar_venta_inexistente(self, client, admin_headers):
        r = client.put(
            f"/api/v1/ventas/{uuid.uuid4()}",
            json={"aprobado": True},
            headers=admin_headers,
        )
        assert r.status_code == 404

    def test_actualizar_stock_insuficiente_al_aprobar(self, client, admin_headers):
        inventario = self._crear_inventario(client, admin_headers, stock=10)
        creado = client.post(
            "/api/v1/ventas",
            json={"items": [{"inventario_id": inventario["id"], "cantidad": 5}]},
            headers=admin_headers,
        ).json()
        client.post(
            "/api/v1/ventas",
            json={"items": [{"inventario_id": inventario["id"], "cantidad": 8}], "aprobado": True},
            headers=admin_headers,
        )
        assert self._get_stock(client, admin_headers, inventario["id"]) == 2
        r = client.put(
            f"/api/v1/ventas/{creado['id']}",
            json={"aprobado": True},
            headers=admin_headers,
        )
        assert r.status_code == 422
        assert self._get_stock(client, admin_headers, inventario["id"]) == 2

    def test_eliminar_venta_aprobada_restaura_stock(self, client, admin_headers):
        inventario = self._crear_inventario(client, admin_headers, stock=10, precio=10.5)
        creado = client.post(
            "/api/v1/ventas",
            json={"items": [{"inventario_id": inventario["id"], "cantidad": 2}], "aprobado": True},
            headers=admin_headers,
        ).json()
        assert self._get_stock(client, admin_headers, inventario["id"]) == 8
        r = client.delete(f"/api/v1/ventas/{creado['id']}", headers=admin_headers)
        assert r.status_code == 204
        assert self._get_stock(client, admin_headers, inventario["id"]) == 10

    def test_eliminar_venta_no_aprobada_sin_cambio_stock(self, client, admin_headers):
        inventario = self._crear_inventario(client, admin_headers, stock=10)
        creado = client.post(
            "/api/v1/ventas",
            json={"items": [{"inventario_id": inventario["id"], "cantidad": 1}]},
            headers=admin_headers,
        ).json()
        assert self._get_stock(client, admin_headers, inventario["id"]) == 10
        r = client.delete(f"/api/v1/ventas/{creado['id']}", headers=admin_headers)
        assert r.status_code == 204
        assert self._get_stock(client, admin_headers, inventario["id"]) == 10

    def test_eliminar_venta_fuera_de_plazo(self, client, admin_headers, db_session):
        inventario = self._crear_inventario(client, admin_headers)
        creado = client.post(
            "/api/v1/ventas",
            json={"items": [{"inventario_id": inventario["id"], "cantidad": 1}]},
            headers=admin_headers,
        ).json()
        self._set_venta_fecha(db_session, creado["id"], dias=8)
        r = client.delete(f"/api/v1/ventas/{creado['id']}", headers=admin_headers)
        assert r.status_code == 400
        assert client.get(f"/api/v1/ventas/{creado['id']}", headers=admin_headers).status_code == 200

    def test_resumen_mensual_ventas_aprobadas(self, client, admin_headers):
        inventario = self._crear_inventario(client, admin_headers, stock=20, precio=10.5)
        aprobada = client.post(
            "/api/v1/ventas",
            json={"items": [{"inventario_id": inventario["id"], "cantidad": 2}], "aprobado": True},
            headers=admin_headers,
        )
        assert aprobada.status_code == 201, aprobada.text
        no_aprobada = client.post(
            "/api/v1/ventas",
            json={"items": [{"inventario_id": inventario["id"], "cantidad": 1}]},
            headers=admin_headers,
        )
        assert no_aprobada.status_code == 201, no_aprobada.text
        r = client.get("/api/v1/ventas/estadisticas?periodo=mes", headers=admin_headers)
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["periodo"] == "mes"
        assert float(body["total"]) == 21.0
        assert body["cantidad_ventas"] == 1
        assert body["desde"] and body["hasta"]

    def test_resumen_por_periodos_dia_semana_anio(self, client, admin_headers):
        inventario = self._crear_inventario(client, admin_headers, stock=10, precio=10.5)
        r = client.post(
            "/api/v1/ventas",
            json={"items": [{"inventario_id": inventario["id"], "cantidad": 1}], "aprobado": True},
            headers=admin_headers,
        )
        assert r.status_code == 201, r.text
        for periodo in ("dia", "semana", "año"):
            resp = client.get(f"/api/v1/ventas/estadisticas?periodo={periodo}", headers=admin_headers)
            assert resp.status_code == 200, resp.text
            assert float(resp.json()["total"]) == 10.5
            assert resp.json()["cantidad_ventas"] == 1

    def test_resumen_periodo_sin_ventas(self, client, admin_headers):
        r = client.get("/api/v1/ventas/estadisticas?periodo=mes", headers=admin_headers)
        assert r.status_code == 200, r.text
        body = r.json()
        assert float(body["total"]) == 0.0
        assert body["cantidad_ventas"] == 0

    def test_resumen_excluye_no_aprobadas_y_eliminadas(self, client, admin_headers):
        inventario = self._crear_inventario(client, admin_headers, stock=20, precio=10.5)
        aprobada = client.post(
            "/api/v1/ventas",
            json={"items": [{"inventario_id": inventario["id"], "cantidad": 1}], "aprobado": True},
            headers=admin_headers,
        )
        assert aprobada.status_code == 201, aprobada.text
        no_aprobada = client.post(
            "/api/v1/ventas",
            json={"items": [{"inventario_id": inventario["id"], "cantidad": 1}]},
            headers=admin_headers,
        )
        assert no_aprobada.status_code == 201, no_aprobada.text
        a_eliminar = client.post(
            "/api/v1/ventas",
            json={"items": [{"inventario_id": inventario["id"], "cantidad": 1}], "aprobado": True},
            headers=admin_headers,
        )
        assert a_eliminar.status_code == 201, a_eliminar.text
        r = client.delete(f"/api/v1/ventas/{a_eliminar.json()['id']}", headers=admin_headers)
        assert r.status_code == 204
        r = client.get("/api/v1/ventas/estadisticas?periodo=mes", headers=admin_headers)
        assert r.status_code == 200, r.text
        body = r.json()
        assert float(body["total"]) == 10.5
        assert body["cantidad_ventas"] == 1

    def test_resumen_periodo_invalido(self, client, admin_headers):
        r = client.get("/api/v1/ventas/estadisticas?periodo=bimestre", headers=admin_headers)
        assert r.status_code == 422

    def test_resumen_periodo_por_defecto(self, client, admin_headers):
        inventario = self._crear_inventario(client, admin_headers, stock=10, precio=10.5)
        r = client.post(
            "/api/v1/ventas",
            json={"items": [{"inventario_id": inventario["id"], "cantidad": 1}], "aprobado": True},
            headers=admin_headers,
        )
        assert r.status_code == 201, r.text
        r = client.get("/api/v1/ventas/estadisticas", headers=admin_headers)
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["periodo"] == "mes"
        assert float(body["total"]) == 10.5
        assert body["cantidad_ventas"] == 1
