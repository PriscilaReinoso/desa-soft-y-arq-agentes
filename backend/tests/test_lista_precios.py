import json
import uuid
from io import BytesIO

from openpyxl import Workbook


class TestListaPrecios:
    def _crear_categoria(self, client, headers, nombre="HERRAMIENTAS"):
        r = client.post("/api/v1/categorias", json={"nombre": nombre}, headers=headers)
        assert r.status_code == 201, r.text
        return r.json()

    def _crear_proveedor(self, client, headers, nombre="Prov", telefono="1000"):
        r = client.post(
            "/api/v1/proveedores",
            json={"nombre": nombre, "apellido": "SRL", "telefono": telefono},
            headers=headers,
        )
        assert r.status_code == 201, r.text
        return r.json()

    def _crear_articulo(self, client, headers, cat_id, nombre="Clavo"):
        r = client.post(
            "/api/v1/articulos", json={"nombre": nombre, "categoria_id": cat_id}, headers=headers
        )
        assert r.status_code == 201, r.text
        return r.json()

    def _crear_medida(self, client, headers, unidad="unidad", medida="unidad"):
        r = client.post(
            "/api/v1/medidas", json={"unidad_medida": unidad, "medida": medida}, headers=headers
        )
        assert r.status_code == 201, r.text
        return r.json()

    def test_alta_json_proveedor_existente_articulos_nuevos(self, client, admin_headers):
        cat = self._crear_categoria(client, admin_headers)
        proveedor = self._crear_proveedor(client, admin_headers)
        r = client.post(
            "/api/v1/listas-precios",
            json={
                "proveedor_id": proveedor["id"],
                "items": [
                    {
                        "articulo": {"nombre": "Clavo", "categoria_id": cat["id"]},
                        "medida": {"unidad_medida": "unidad", "medida": "unidad"},
                        "precio_lista": 15.5,
                    }
                ],
            },
            headers=admin_headers,
        )
        assert r.status_code == 201, r.text
        body = r.json()
        assert len(body) == 1
        item = body[0]
        assert item["articulo"]["nombre"] == "Clavo"
        assert float(item["precio_lista"]) == 15.5
        assert item["proveedor"]["id"] == proveedor["id"]

    def test_alta_json_reutilizando_articulos_existentes(self, client, admin_headers):
        cat = self._crear_categoria(client, admin_headers)
        proveedor = self._crear_proveedor(client, admin_headers)
        articulo = self._crear_articulo(client, admin_headers, cat["id"], "Martillo")
        medida = self._crear_medida(client, admin_headers)
        r = client.post(
            "/api/v1/listas-precios",
            json={
                "proveedor_id": proveedor["id"],
                "items": [
                    {
                        "articulo": {"id": articulo["id"]},
                        "medida": {"id": medida["id"]},
                        "precio_lista": 20,
                    }
                ],
            },
            headers=admin_headers,
        )
        assert r.status_code == 201, r.text
        item = r.json()[0]
        assert item["articulo"]["id"] == articulo["id"]
        assert item["medida"]["id"] == medida["id"]

    def test_alta_con_proveedor_nuevo(self, client, admin_headers):
        cat = self._crear_categoria(client, admin_headers)
        r = client.post(
            "/api/v1/listas-precios",
            json={
                "proveedor": {"nombre": "Nuevo", "apellido": "Prov", "telefono": "2000"},
                "items": [
                    {
                        "articulo": {"nombre": "Tornillo", "categoria_id": cat["id"]},
                        "medida": {"unidad_medida": "unidad", "medida": "unidad"},
                        "precio_lista": 3,
                    }
                ],
            },
            headers=admin_headers,
        )
        assert r.status_code == 201, r.text
        assert r.json()[0]["proveedor"]["nombre"] == "Nuevo"
        proveedores = client.get("/api/v1/proveedores", headers=admin_headers).json()
        assert len(proveedores) == 1

    def test_alta_proveedor_nuevo_invalido_no_persiste(self, client, admin_headers):
        cat = self._crear_categoria(client, admin_headers)
        self._crear_proveedor(client, admin_headers, telefono="3000")
        r = client.post(
            "/api/v1/listas-precios",
            json={
                "proveedor": {"nombre": "Otro", "apellido": "Prov", "telefono": "3000"},
                "items": [
                    {
                        "articulo": {"nombre": "Clavo", "categoria_id": cat["id"]},
                        "medida": {"unidad_medida": "unidad", "medida": "unidad"},
                        "precio_lista": 5,
                    }
                ],
            },
            headers=admin_headers,
        )
        assert r.status_code == 409
        assert client.get("/api/v1/listas-precios", headers=admin_headers).json() == []
        assert len(client.get("/api/v1/proveedores", headers=admin_headers).json()) == 1

    def test_precio_lista_negativo(self, client, admin_headers):
        proveedor = self._crear_proveedor(client, admin_headers)
        r = client.post(
            "/api/v1/listas-precios",
            json={
                "proveedor_id": proveedor["id"],
                "items": [
                    {
                        "articulo": {"nombre": "Clavo", "categoria_id": str(uuid.uuid4())},
                        "medida": {"unidad_medida": "unidad", "medida": "unidad"},
                        "precio_lista": -1,
                    }
                ],
            },
            headers=admin_headers,
        )
        assert r.status_code == 422
        assert client.get("/api/v1/listas-precios", headers=admin_headers).json() == []

    def test_articulo_inexistente(self, client, admin_headers):
        proveedor = self._crear_proveedor(client, admin_headers)
        r = client.post(
            "/api/v1/listas-precios",
            json={
                "proveedor_id": proveedor["id"],
                "items": [
                    {
                        "articulo": {"id": str(uuid.uuid4())},
                        "medida": {"unidad_medida": "unidad", "medida": "unidad"},
                        "precio_lista": 5,
                    }
                ],
            },
            headers=admin_headers,
        )
        assert r.status_code == 400
        assert client.get("/api/v1/listas-precios", headers=admin_headers).json() == []

    def test_proveedor_inexistente(self, client, admin_headers):
        cat = self._crear_categoria(client, admin_headers)
        r = client.post(
            "/api/v1/listas-precios",
            json={
                "proveedor_id": str(uuid.uuid4()),
                "items": [
                    {
                        "articulo": {"nombre": "Clavo", "categoria_id": cat["id"]},
                        "medida": {"unidad_medida": "unidad", "medida": "unidad"},
                        "precio_lista": 5,
                    }
                ],
            },
            headers=admin_headers,
        )
        assert r.status_code == 400

    def test_registro_existente_se_actualiza(self, client, admin_headers):
        cat = self._crear_categoria(client, admin_headers)
        proveedor = self._crear_proveedor(client, admin_headers)
        articulo = self._crear_articulo(client, admin_headers, cat["id"], "Bulon")
        medida = self._crear_medida(client, admin_headers)
        payload = {
            "proveedor_id": proveedor["id"],
            "items": [
                {"articulo": {"id": articulo["id"]}, "medida": {"id": medida["id"]}, "precio_lista": 10}
            ],
        }
        assert client.post("/api/v1/listas-precios", json=payload, headers=admin_headers).status_code == 201
        payload["items"][0]["precio_lista"] = 12
        r = client.post("/api/v1/listas-precios", json=payload, headers=admin_headers)
        assert r.status_code == 201, r.text
        registros = client.get("/api/v1/listas-precios", headers=admin_headers).json()
        assert len(registros) == 1
        assert float(registros[0]["precio_lista"]) == 12

    def test_alta_json_reutiliza_articulo_por_nombre_sin_id(self, client, admin_headers):
        cat = self._crear_categoria(client, admin_headers)
        proveedor = self._crear_proveedor(client, admin_headers)
        articulo = self._crear_articulo(client, admin_headers, cat["id"], "Martillo")
        r = client.post(
            "/api/v1/listas-precios",
            json={
                "proveedor_id": proveedor["id"],
                "items": [
                    {
                        "articulo": {"nombre": "Martillo"},
                        "medida": {"unidad_medida": "unidad", "medida": "unidad"},
                        "precio_lista": 18,
                    }
                ],
            },
            headers=admin_headers,
        )
        assert r.status_code == 201, r.text
        item = r.json()[0]
        assert item["articulo"]["id"] == articulo["id"]
        assert len(client.get("/api/v1/articulos", headers=admin_headers).json()) == 1

    def test_rollback_falla_en_un_item(self, client, admin_headers):
        cat = self._crear_categoria(client, admin_headers)
        proveedor = self._crear_proveedor(client, admin_headers)
        r = client.post(
            "/api/v1/listas-precios",
            json={
                "proveedor_id": proveedor["id"],
                "items": [
                    {
                        "articulo": {"nombre": "Clavo", "categoria_id": cat["id"]},
                        "medida": {"unidad_medida": "unidad", "medida": "unidad"},
                        "precio_lista": 5,
                    },
                    {
                        "articulo": {"id": str(uuid.uuid4())},
                        "medida": {"unidad_medida": "unidad", "medida": "unidad"},
                        "precio_lista": 8,
                    },
                ],
            },
            headers=admin_headers,
        )
        assert r.status_code == 400
        assert client.get("/api/v1/listas-precios", headers=admin_headers).json() == []
        articulos = client.get("/api/v1/articulos", headers=admin_headers).json()
        assert all(a["nombre"] != "Clavo" for a in articulos)

    def _build_excel(self, rows, header):
        wb = Workbook()
        ws = wb.active
        ws.append(header)
        for row in rows:
            ws.append(row)
        buf = BytesIO()
        wb.save(buf)
        return buf.getvalue()

    def _mapeo_default(self):
        return json.dumps(
            [
                {"key": "categoria", "value": "categoria"},
                {"key": "nombre", "value": "nombre"},
                {"key": "unidad_medida", "value": "unidad_medida"},
                {"key": "medida", "value": "medida"},
                {"key": "precio_lista", "value": "precio_lista"},
            ]
        )

    def test_alta_excel_exitosa(self, client, admin_headers):
        self._crear_categoria(client, admin_headers, "HERRAMIENTAS")
        proveedor = self._crear_proveedor(client, admin_headers, telefono="4000")
        contenido = self._build_excel(
            [["HERRAMIENTAS", "Clavo 2''", "unidad", "unidad", 5]],
            ["categoria", "nombre", "unidad_medida", "medida", "precio_lista"],
        )
        r = client.post(
            "/api/v1/listas-precios/excel",
            headers=admin_headers,
            files={"archivo": ("lista.xlsx", contenido, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")},
            data={"mapeo": self._mapeo_default(), "proveedor_id": proveedor["id"]},
        )
        assert r.status_code == 201, r.text
        body = r.json()["registros"]
        assert len(body) == 1
        assert body[0]["articulo"]["nombre"] == "Clavo 2''"
        assert float(body[0]["precio_lista"]) == 5

    def test_alta_excel_articulos_existentes(self, client, admin_headers):
        cat = self._crear_categoria(client, admin_headers, "HERRAMIENTAS")
        proveedor = self._crear_proveedor(client, admin_headers, telefono="5000")
        self._crear_articulo(client, admin_headers, cat["id"], "Clavo 2''")
        contenido = self._build_excel(
            [["HERRAMIENTAS", "Clavo 2''", "unidad", "unidad", 7]],
            ["categoria", "nombre", "unidad_medida", "medida", "precio_lista"],
        )
        r = client.post(
            "/api/v1/listas-precios/excel",
            headers=admin_headers,
            files={"archivo": ("lista.xlsx", contenido, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")},
            data={"mapeo": self._mapeo_default(), "proveedor_id": proveedor["id"]},
        )
        assert r.status_code == 201, r.text
        assert float(r.json()["registros"][0]["precio_lista"]) == 7

    def test_alta_excel_conflicto_en_linea_con_rollback(self, client, admin_headers):
        self._crear_categoria(client, admin_headers, "HERRAMIENTAS")
        proveedor = self._crear_proveedor(client, admin_headers, telefono="6000")
        contenido = self._build_excel(
            [
                ["HERRAMIENTAS", "Clavo", "unidad", "unidad", 5],
                ["HERRAMIENTAS", "Tornillo", "unidad", "unidad", -2],
            ],
            ["categoria", "nombre", "unidad_medida", "medida", "precio_lista"],
        )
        r = client.post(
            "/api/v1/listas-precios/excel",
            headers=admin_headers,
            files={"archivo": ("lista.xlsx", contenido, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")},
            data={"mapeo": self._mapeo_default(), "proveedor_id": proveedor["id"]},
        )
        assert r.status_code == 422
        assert "fila 3" in r.text
        assert "precio_lista" in r.text
        assert client.get("/api/v1/listas-precios", headers=admin_headers).json() == []

    def _mapeo_combinado(self):
        return json.dumps(
            [
                {"key": "categoria", "value": "categoria"},
                {"key": "articulo_medida_combinado", "value": "articulo"},
                {"key": "precio_lista", "value": "precio_lista"},
            ]
        )

    def _post_excel(self, client, admin_headers, proveedor_id, contenido, mapeo):
        return client.post(
            "/api/v1/listas-precios/excel",
            headers=admin_headers,
            files={"archivo": ("lista.xlsx", contenido, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")},
            data={"mapeo": mapeo, "proveedor_id": proveedor_id},
        )

    def test_alta_excel_columna_combinada(self, client, admin_headers):
        self._crear_categoria(client, admin_headers, "HERRAMIENTAS")
        proveedor = self._crear_proveedor(client, admin_headers, telefono="9000")
        contenido = self._build_excel(
            [["HERRAMIENTAS", "Arandelas 1/8 2kg", 5]],
            ["categoria", "articulo", "precio_lista"],
        )
        r = self._post_excel(client, admin_headers, proveedor["id"], contenido, self._mapeo_combinado())
        assert r.status_code == 201, r.text
        body = r.json()["registros"]
        assert len(body) == 1
        assert body[0]["articulo"]["nombre"] == "Arandelas 1/8"
        assert body[0]["medida"]["unidad_medida"] == "kg"
        assert body[0]["medida"]["medida"] == "2"

    def test_alta_excel_encabezados_con_espacios(self, client, admin_headers):
        self._crear_categoria(client, admin_headers, "HERRAMIENTAS")
        proveedor = self._crear_proveedor(client, admin_headers, telefono="9050")
        contenido = self._build_excel(
            [["HERRAMIENTAS", "Arandelas 1/8 2kg", 5]],
            [" categoria ", " articulo ", " precio_lista "],
        )
        mapeo = json.dumps(
            [
                {"key": "categoria", "value": "categoria"},
                {"key": "articulo_medida_combinado", "value": "articulo"},
                {"key": "precio_lista", "value": "precio_lista"},
            ]
        )
        r = self._post_excel(client, admin_headers, proveedor["id"], contenido, mapeo)
        assert r.status_code == 201, r.text
        body = r.json()["registros"]
        assert len(body) == 1
        assert body[0]["articulo"]["nombre"] == "Arandelas 1/8"

    def test_alta_excel_combinada_normaliza_unidad_y_coma_decimal(self, client, admin_headers):
        self._crear_categoria(client, admin_headers, "HERRAMIENTAS")
        proveedor = self._crear_proveedor(client, admin_headers, telefono="9100")
        contenido = self._build_excel(
            [
                ["HERRAMIENTAS", "Tornillo 3UN", 4],
                ["HERRAMIENTAS", "Cable 1,5m", 9],
            ],
            ["categoria", "articulo", "precio_lista"],
        )
        r = self._post_excel(client, admin_headers, proveedor["id"], contenido, self._mapeo_combinado())
        assert r.status_code == 201, r.text
        body = r.json()["registros"]
        assert body[0]["articulo"]["nombre"] == "Tornillo"
        assert body[0]["medida"]["unidad_medida"] == "unidad"
        assert body[0]["medida"]["medida"] == "3"
        assert body[1]["articulo"]["nombre"] == "Cable"
        assert body[1]["medida"]["unidad_medida"] == "m"
        assert body[1]["medida"]["medida"] == "1.5"

    def test_alta_excel_combinada_articulo_existente(self, client, admin_headers):
        cat = self._crear_categoria(client, admin_headers, "HERRAMIENTAS")
        proveedor = self._crear_proveedor(client, admin_headers, telefono="9200")
        articulo = self._crear_articulo(client, admin_headers, cat["id"], "Arandelas 1/8")
        contenido = self._build_excel(
            [["HERRAMIENTAS", "Arandelas 1/8 500g", 6]],
            ["categoria", "articulo", "precio_lista"],
        )
        r = self._post_excel(client, admin_headers, proveedor["id"], contenido, self._mapeo_combinado())
        assert r.status_code == 201, r.text
        body = r.json()["registros"][0]
        assert body["articulo"]["id"] == articulo["id"]
        assert body["medida"]["unidad_medida"] == "g"
        assert body["medida"]["medida"] == "500"

    def test_alta_excel_combinada_medida_en_el_medio(self, client, admin_headers):
        self._crear_categoria(client, admin_headers, "HERRAMIENTAS")
        proveedor = self._crear_proveedor(client, admin_headers, telefono="9600")
        contenido = self._build_excel(
            [["HERRAMIENTAS", "DISCO DE CORTE 115MM KUPER", 12]],
            ["categoria", "articulo", "precio_lista"],
        )
        r = self._post_excel(client, admin_headers, proveedor["id"], contenido, self._mapeo_combinado())
        assert r.status_code == 201, r.text
        item = r.json()["registros"][0]
        assert item["articulo"]["nombre"] == "DISCO DE CORTE KUPER"
        assert item["medida"]["unidad_medida"] == "mm"
        assert item["medida"]["medida"] == "115"

    def test_alta_excel_combinada_unidades_alternativas_y_multilinea(self, client, admin_headers):
        self._crear_categoria(client, admin_headers, "HERRAMIENTAS")
        proveedor = self._crear_proveedor(client, admin_headers, telefono="9700")
        contenido = self._build_excel(
            [
                ["HERRAMIENTAS", "SIERRA COPA\n 11 PIEZAS IMP", 3],
                ["HERRAMIENTAS", "CINTA MULTIPROPOSITO.T/DUC TAPE 9mts VERDE", 2],
            ],
            ["categoria", "articulo", "precio_lista"],
        )
        r = self._post_excel(client, admin_headers, proveedor["id"], contenido, self._mapeo_combinado())
        assert r.status_code == 201, r.text
        body = r.json()["registros"]
        assert body[0]["articulo"]["nombre"] == "SIERRA COPA IMP"
        assert body[0]["medida"]["unidad_medida"] == "pieza"
        assert body[0]["medida"]["medida"] == "11"
        assert body[1]["articulo"]["nombre"] == "CINTA MULTIPROPOSITO.T/DUC TAPE VERDE"
        assert body[1]["medida"]["unidad_medida"] == "m"
        assert body[1]["medida"]["medida"] == "9"

    def test_alta_excel_combinada_sin_medida_usa_unidad_por_defecto(self, client, admin_headers):
        self._crear_categoria(client, admin_headers, "HERRAMIENTAS")
        proveedor = self._crear_proveedor(client, admin_headers, telefono="9800")
        contenido = self._build_excel(
            [
                ["HERRAMIENTAS", "MASCARA FOTOSENSIBLE TOOLMAK", 8],
                ["HERRAMIENTAS", "CURVA 20 A 90º SANIPLAST", 4],
                ["HERRAMIENTAS", "Tornillo 5caja", 7],
            ],
            ["categoria", "articulo", "precio_lista"],
        )
        r = self._post_excel(client, admin_headers, proveedor["id"], contenido, self._mapeo_combinado())
        assert r.status_code == 201, r.text
        body = r.json()["registros"]
        assert [i["articulo"]["nombre"] for i in body] == [
            "MASCARA FOTOSENSIBLE TOOLMAK",
            "CURVA 20 A 90º SANIPLAST",
            "Tornillo 5caja",
        ]
        for item in body:
            assert item["medida"]["unidad_medida"] == "unidad"
            assert item["medida"]["medida"] == "1"
        assert len({i["medida"]["id"] for i in body}) == 1

    def test_alta_excel_combinada_unidad_de_db(self, client, admin_headers):
        self._crear_categoria(client, admin_headers, "HERRAMIENTAS")
        proveedor = self._crear_proveedor(client, admin_headers, telefono="9250")
        medida = self._crear_medida(client, admin_headers, unidad="caja", medida="5")
        contenido = self._build_excel(
            [["HERRAMIENTAS", "Tornillo 5caja", 7]],
            ["categoria", "articulo", "precio_lista"],
        )
        r = self._post_excel(client, admin_headers, proveedor["id"], contenido, self._mapeo_combinado())
        assert r.status_code == 201, r.text
        item = r.json()["registros"][0]
        assert item["articulo"]["nombre"] == "Tornillo"
        assert item["medida"]["unidad_medida"] == "caja"
        assert item["medida"]["medida"] == "5"
        assert item["medida"]["id"] == medida["id"]

    def test_alta_excel_combinada_unidad_de_db_se_crea_si_no_existe(self, client, admin_headers):
        self._crear_categoria(client, admin_headers, "HERRAMIENTAS")
        proveedor = self._crear_proveedor(client, admin_headers, telefono="9251")
        self._crear_medida(client, admin_headers, unidad="caja", medida="5")
        contenido = self._build_excel(
            [["HERRAMIENTAS", "Tornillo 3caja", 7]],
            ["categoria", "articulo", "precio_lista"],
        )
        r = self._post_excel(client, admin_headers, proveedor["id"], contenido, self._mapeo_combinado())
        assert r.status_code == 201, r.text
        item = r.json()["registros"][0]
        assert item["articulo"]["nombre"] == "Tornillo"
        assert item["medida"]["unidad_medida"] == "caja"
        assert item["medida"]["medida"] == "3"

    def test_alta_excel_combinada_unidad_de_db_prevalece_sobre_respaldo(self, client, admin_headers):
        self._crear_categoria(client, admin_headers, "HERRAMIENTAS")
        proveedor = self._crear_proveedor(client, admin_headers, telefono="9252")
        medida = self._crear_medida(client, admin_headers, unidad="un", medida="2")
        contenido = self._build_excel(
            [["HERRAMIENTAS", "Tornillo 2un", 7]],
            ["categoria", "articulo", "precio_lista"],
        )
        r = self._post_excel(client, admin_headers, proveedor["id"], contenido, self._mapeo_combinado())
        assert r.status_code == 201, r.text
        item = r.json()["registros"][0]
        assert item["medida"]["unidad_medida"] == "un"
        assert item["medida"]["id"] == medida["id"]

    def test_alta_excel_celda_combinada_vacia_se_descarta(self, client, admin_headers):
        self._crear_categoria(client, admin_headers, "HERRAMIENTAS")
        proveedor = self._crear_proveedor(client, admin_headers, telefono="9900")
        contenido = self._build_excel(
            [
                ["HERRAMIENTAS", "", 5],
                ["HERRAMIENTAS", "Tornillo 4un", 3],
            ],
            ["categoria", "articulo", "precio_lista"],
        )
        r = self._post_excel(client, admin_headers, proveedor["id"], contenido, self._mapeo_combinado())
        assert r.status_code == 201, r.text
        body = r.json()
        assert len(body["registros"]) == 1
        assert body["registros"][0]["articulo"]["nombre"] == "Tornillo"
        assert body["lineas_descartadas"] == [{"fila": 2, "motivo": "falta la identificación del artículo"}]

    def test_alta_excel_lineas_separadoras_se_descartan(self, client, admin_headers):
        self._crear_categoria(client, admin_headers, "HERRAMIENTAS")
        proveedor = self._crear_proveedor(client, admin_headers, telefono="9950")
        contenido = self._build_excel(
            [
                ["LISTA DE PRECIOS 2026", "", ""],
                ["NOTA: precios sujetos a modificación sin aviso", "", ""],
                ["HERRAMIENTAS", "", 0],
                ["HERRAMIENTAS", "Disco de corte 115mm Kuper", 12],
                ["HERRAMIENTAS", "Tornillo 4un"],
            ],
            ["categoria", "articulo", "precio_lista"],
        )
        r = self._post_excel(client, admin_headers, proveedor["id"], contenido, self._mapeo_combinado())
        assert r.status_code == 201, r.text
        body = r.json()
        assert [i["articulo"]["nombre"] for i in body["registros"]] == ["Disco de corte Kuper"]
        assert [(d["fila"], d["motivo"]) for d in body["lineas_descartadas"]] == [
            (2, "falta la identificación del artículo"),
            (3, "falta la identificación del artículo"),
            (4, "falta la identificación del artículo"),
            (6, "falta el precio de lista"),
        ]
        articulos = client.get("/api/v1/articulos", headers=admin_headers).json()
        assert all(a["nombre"] != "Tornillo" for a in articulos)

    def test_alta_excel_precio_con_moneda_y_formato_local(self, client, admin_headers):
        self._crear_categoria(client, admin_headers, "HERRAMIENTAS")
        proveedor = self._crear_proveedor(client, admin_headers, telefono="9960")
        contenido = self._build_excel(
            [
                ["HERRAMIENTAS", "Tornillo 2un", "$ 25"],
                ["HERRAMIENTAS", "Arandela 3un", "USD 1,76"],
                ["HERRAMIENTAS", "Clavo 5un", "1.234,56"],
            ],
            ["categoria", "articulo", "precio_lista"],
        )
        r = self._post_excel(client, admin_headers, proveedor["id"], contenido, self._mapeo_combinado())
        assert r.status_code == 201, r.text
        precios = [float(i["precio_lista"]) for i in r.json()["registros"]]
        assert precios == [25, 1.76, 1234.56]

    def test_alta_excel_combinada_articulo_repetido_ultima_gana(self, client, admin_headers):
        self._crear_categoria(client, admin_headers, "HERRAMIENTAS")
        proveedor = self._crear_proveedor(client, admin_headers, telefono="9940")
        contenido = self._build_excel(
            [
                ["HERRAMIENTAS", "Arandelas 1/8 2kg", 5],
                ["HERRAMIENTAS", "Arandelas 1/8 3kg", 7],
            ],
            ["categoria", "articulo", "precio_lista"],
        )
        r = self._post_excel(client, admin_headers, proveedor["id"], contenido, self._mapeo_combinado())
        assert r.status_code == 201, r.text
        body = r.json()["registros"]
        assert len(body) == 2
        assert body[0]["id"] == body[1]["id"]
        assert float(body[1]["precio_lista"]) == 7
        assert body[1]["medida"]["medida"] == "3"
        articulos = [
            a for a in client.get("/api/v1/articulos", headers=admin_headers).json() if a["nombre"] == "Arandelas 1/8"
        ]
        assert len(articulos) == 1
        registros = client.get("/api/v1/listas-precios", headers=admin_headers).json()
        assert len(registros) == 1
        assert float(registros[0]["precio_lista"]) == 7

    def _mapeo_combinado_sin_categoria(self):
        return json.dumps(
            [
                {"key": "articulo_medida_combinado", "value": "articulo"},
                {"key": "precio_lista", "value": "precio_lista"},
            ]
        )

    def test_alta_excel_combinada_sin_columna_categoria(self, client, admin_headers):
        self._crear_categoria(client, admin_headers, "HERRAMIENTAS")
        proveedor = self._crear_proveedor(client, admin_headers, telefono="9910")
        contenido = self._build_excel(
            [["MASCARA FOTOSENSIBLE TOOLMAK", 8]],
            ["articulo", "precio_lista"],
        )
        r = self._post_excel(client, admin_headers, proveedor["id"], contenido, self._mapeo_combinado_sin_categoria())
        assert r.status_code == 201, r.text
        item = r.json()["registros"][0]
        assert item["articulo"]["nombre"] == "MASCARA FOTOSENSIBLE TOOLMAK"
        assert item["articulo"]["categoria_id"] is None
        assert item["medida"]["unidad_medida"] == "unidad"
        assert item["medida"]["medida"] == "1"

    def test_alta_excel_combinada_con_columna_categoria(self, client, admin_headers):
        cat = self._crear_categoria(client, admin_headers, "HERRAMIENTAS")
        proveedor = self._crear_proveedor(client, admin_headers, telefono="9920")
        contenido = self._build_excel(
            [
                ["", "DISCO DE CORTE 115MM KUPER", 12],
                ["HERRAMIENTAS", "Tornillo 4un", 3],
            ],
            ["categoria", "articulo", "precio_lista"],
        )
        r = self._post_excel(client, admin_headers, proveedor["id"], contenido, self._mapeo_combinado())
        assert r.status_code == 201, r.text
        body = r.json()["registros"]
        assert body[0]["articulo"]["categoria_id"] is None
        assert body[0]["articulo"]["nombre"] == "DISCO DE CORTE KUPER"
        assert body[1]["articulo"]["categoria_id"] == cat["id"]
        assert body[1]["articulo"]["nombre"] == "Tornillo"

    def test_alta_excel_combinada_categoria_inexistente_rollback(self, client, admin_headers):
        self._crear_categoria(client, admin_headers, "HERRAMIENTAS")
        proveedor = self._crear_proveedor(client, admin_headers, telefono="9930")
        contenido = self._build_excel(
            [["NOEXISTE", "Tornillo 4un", 3]],
            ["categoria", "articulo", "precio_lista"],
        )
        r = self._post_excel(client, admin_headers, proveedor["id"], contenido, self._mapeo_combinado())
        assert r.status_code == 422
        assert client.get("/api/v1/listas-precios", headers=admin_headers).json() == []

    def test_alta_excel_mapeo_ambiguo_con_combinada_rechazado(self, client, admin_headers):
        self._crear_categoria(client, admin_headers, "HERRAMIENTAS")
        proveedor = self._crear_proveedor(client, admin_headers, telefono="9500")
        contenido = self._build_excel(
            [["HERRAMIENTAS", "Arandelas 1/8 2kg", 5]],
            ["categoria", "articulo", "precio_lista"],
        )
        mapeo = json.dumps(
            [
                {"key": "nombre", "value": "articulo"},
                {"key": "articulo_medida_combinado", "value": "articulo"},
                {"key": "precio_lista", "value": "precio_lista"},
            ]
        )
        r = self._post_excel(client, admin_headers, proveedor["id"], contenido, mapeo)
        assert r.status_code == 422
        assert "articulo_medida_combinado" in r.text

    def test_actualizar_precio(self, client, admin_headers):
        cat = self._crear_categoria(client, admin_headers)
        proveedor = self._crear_proveedor(client, admin_headers, telefono="7000")
        articulo = self._crear_articulo(client, admin_headers, cat["id"], "Pintura")
        medida = self._crear_medida(client, admin_headers)
        creado = client.post(
            "/api/v1/listas-precios",
            json={
                "proveedor_id": proveedor["id"],
                "items": [
                    {"articulo": {"id": articulo["id"]}, "medida": {"id": medida["id"]}, "precio_lista": 10}
                ],
            },
            headers=admin_headers,
        ).json()[0]
        r = client.put(
            f"/api/v1/listas-precios/{creado['id']}",
            json={"precio_lista": 25},
            headers=admin_headers,
        )
        assert r.status_code == 200, r.text
        assert float(r.json()["precio_lista"]) == 25

    def test_actualizar_por_id_articulo_proveedor(self, client, admin_headers):
        cat = self._crear_categoria(client, admin_headers)
        proveedor = self._crear_proveedor(client, admin_headers, telefono="8000")
        articulo = self._crear_articulo(client, admin_headers, cat["id"], "Lija")
        medida = self._crear_medida(client, admin_headers)
        creado = client.post(
            "/api/v1/listas-precios",
            json={
                "proveedor_id": proveedor["id"],
                "items": [
                    {
                        "articulo": {"id": articulo["id"]},
                        "medida": {"id": medida["id"]},
                        "id_articulo_proveedor": "LP-001",
                        "precio_lista": 10,
                    }
                ],
            },
            headers=admin_headers,
        ).json()[0]
        r = client.put(
            f"/api/v1/listas-precios/{creado['id']}",
            json={"precio_lista": 30, "id_articulo_proveedor": "LP-001"},
            headers=admin_headers,
        )
        assert r.status_code == 200, r.text
        assert float(r.json()["precio_lista"]) == 30

    def test_actualizar_id_articulo_proveedor_invalido(self, client, admin_headers):
        cat = self._crear_categoria(client, admin_headers)
        proveedor = self._crear_proveedor(client, admin_headers, telefono="9000")
        articulo = self._crear_articulo(client, admin_headers, cat["id"], "Disco")
        medida = self._crear_medida(client, admin_headers)
        creado = client.post(
            "/api/v1/listas-precios",
            json={
                "proveedor_id": proveedor["id"],
                "items": [
                    {"articulo": {"id": articulo["id"]}, "medida": {"id": medida["id"]}, "precio_lista": 10}
                ],
            },
            headers=admin_headers,
        ).json()[0]
        r = client.put(
            f"/api/v1/listas-precios/{creado['id']}",
            json={"precio_lista": 30, "id_articulo_proveedor": "OTRO"},
            headers=admin_headers,
        )
        assert r.status_code == 404

    def test_actualizar_registro_inexistente(self, client, admin_headers):
        r = client.put(
            f"/api/v1/listas-precios/{uuid.uuid4()}",
            json={"precio_lista": 30},
            headers=admin_headers,
        )
        assert r.status_code == 404

    def test_actualizar_precio_negativo(self, client, admin_headers):
        cat = self._crear_categoria(client, admin_headers)
        proveedor = self._crear_proveedor(client, admin_headers, telefono="1100")
        articulo = self._crear_articulo(client, admin_headers, cat["id"], "Pinza")
        medida = self._crear_medida(client, admin_headers)
        creado = client.post(
            "/api/v1/listas-precios",
            json={
                "proveedor_id": proveedor["id"],
                "items": [
                    {"articulo": {"id": articulo["id"]}, "medida": {"id": medida["id"]}, "precio_lista": 10}
                ],
            },
            headers=admin_headers,
        ).json()[0]
        r = client.put(
            f"/api/v1/listas-precios/{creado['id']}",
            json={"precio_lista": -1},
            headers=admin_headers,
        )
        assert r.status_code == 422

    def test_listar_sin_filtros(self, client, admin_headers):
        cat = self._crear_categoria(client, admin_headers)
        proveedor = self._crear_proveedor(client, admin_headers, telefono="1200")
        articulo = self._crear_articulo(client, admin_headers, cat["id"], "Broca")
        medida = self._crear_medida(client, admin_headers)
        client.post(
            "/api/v1/listas-precios",
            json={
                "proveedor_id": proveedor["id"],
                "items": [
                    {"articulo": {"id": articulo["id"]}, "medida": {"id": medida["id"]}, "precio_lista": 10}
                ],
            },
            headers=admin_headers,
        )
        r = client.get("/api/v1/listas-precios", headers=admin_headers)
        assert r.status_code == 200
        assert len(r.json()) == 1

    def test_listar_filtro_por_proveedor(self, client, admin_headers):
        cat = self._crear_categoria(client, admin_headers)
        proveedor1 = self._crear_proveedor(client, admin_headers, "Prov1", telefono="1300")
        proveedor2 = self._crear_proveedor(client, admin_headers, "Prov2", telefono="1400")
        medida = self._crear_medida(client, admin_headers)
        articulo1 = self._crear_articulo(client, admin_headers, cat["id"], "Articulo1")
        articulo2 = self._crear_articulo(client, admin_headers, cat["id"], "Articulo2")
        for proveedor, articulo in [(proveedor1, articulo1), (proveedor2, articulo2)]:
            client.post(
                "/api/v1/listas-precios",
                json={
                    "proveedor_id": proveedor["id"],
                    "items": [
                        {"articulo": {"id": articulo["id"]}, "medida": {"id": medida["id"]}, "precio_lista": 10}
                    ],
                },
                headers=admin_headers,
            )
        r = client.get(f"/api/v1/listas-precios?proveedor_id={proveedor1['id']}", headers=admin_headers)
        assert r.status_code == 200
        body = r.json()
        assert len(body) == 1
        assert body[0]["proveedor"]["id"] == proveedor1["id"]

    def test_listar_filtro_por_categoria(self, client, admin_headers):
        cat1 = self._crear_categoria(client, admin_headers, "CAT1")
        cat2 = self._crear_categoria(client, admin_headers, "CAT2")
        proveedor = self._crear_proveedor(client, admin_headers, telefono="1500")
        medida = self._crear_medida(client, admin_headers)
        articulo1 = self._crear_articulo(client, admin_headers, cat1["id"], "ArticuloCat1")
        articulo2 = self._crear_articulo(client, admin_headers, cat2["id"], "ArticuloCat2")
        for articulo in [articulo1, articulo2]:
            client.post(
                "/api/v1/listas-precios",
                json={
                    "proveedor_id": proveedor["id"],
                    "items": [
                        {"articulo": {"id": articulo["id"]}, "medida": {"id": medida["id"]}, "precio_lista": 10}
                    ],
                },
                headers=admin_headers,
            )
        r = client.get(f"/api/v1/listas-precios?categoria_ids={cat1['id']}", headers=admin_headers)
        assert r.status_code == 200
        body = r.json()
        assert len(body) == 1
        assert body[0]["articulo"]["id"] == articulo1["id"]

    def test_listar_filtro_por_articulos(self, client, admin_headers):
        cat = self._crear_categoria(client, admin_headers)
        proveedor = self._crear_proveedor(client, admin_headers, telefono="1600")
        medida = self._crear_medida(client, admin_headers)
        articulo1 = self._crear_articulo(client, admin_headers, cat["id"], "ArticuloA")
        articulo2 = self._crear_articulo(client, admin_headers, cat["id"], "ArticuloB")
        for articulo in [articulo1, articulo2]:
            client.post(
                "/api/v1/listas-precios",
                json={
                    "proveedor_id": proveedor["id"],
                    "items": [
                        {"articulo": {"id": articulo["id"]}, "medida": {"id": medida["id"]}, "precio_lista": 10}
                    ],
                },
                headers=admin_headers,
            )
        r = client.get(f"/api/v1/listas-precios?articulos={articulo2['id']}", headers=admin_headers)
        assert r.status_code == 200
        body = r.json()
        assert len(body) == 1
        assert body[0]["articulo"]["id"] == articulo2["id"]

    def test_cantidad_por_proveedor(self, client, admin_headers):
        cat = self._crear_categoria(client, admin_headers, "CANTCAT")
        p1 = self._crear_proveedor(client, admin_headers, nombre="ProvA", telefono="1800")
        p2 = self._crear_proveedor(client, admin_headers, nombre="ProvB", telefono="1801")
        medida = self._crear_medida(client, admin_headers)
        articulo1 = self._crear_articulo(client, admin_headers, cat["id"], "ArtCantA")
        articulo2 = self._crear_articulo(client, admin_headers, cat["id"], "ArtCantB")
        for proveedor, articulos in [(p1, [articulo1, articulo2]), (p2, [articulo2])]:
            for articulo in articulos:
                client.post(
                    "/api/v1/listas-precios",
                    json={
                        "proveedor_id": proveedor["id"],
                        "items": [
                            {"articulo": {"id": articulo["id"]}, "medida": {"id": medida["id"]}, "precio_lista": 10}
                        ],
                    },
                    headers=admin_headers,
                )
        p3 = self._crear_proveedor(client, admin_headers, nombre="ProvC", telefono="1802")
        r = client.get("/api/v1/listas-precios/cantidad-por-proveedor", headers=admin_headers)
        assert r.status_code == 200, r.text
        body = r.json()
        assert [(i["proveedor"]["id"], i["cantidad"]) for i in body] == [(p1["id"], 2), (p2["id"], 1)]
        assert all(i["proveedor"]["id"] != p3["id"] for i in body)
        cats_p1 = [(c["categoria"]["id"], c["cantidad"]) for c in body[0]["por_categoria"]]
        assert len(cats_p1) == 1
        assert cats_p1[0] == (cat["id"], 2)
        cats_p2 = [(c["categoria"]["id"], c["cantidad"]) for c in body[1]["por_categoria"]]
        assert cats_p2 == [(cat["id"], 1)]

    def test_cantidad_por_proveedor_excluye_eliminados(self, client, admin_headers):
        cat = self._crear_categoria(client, admin_headers, "CANTCAT2")
        proveedor = self._crear_proveedor(client, admin_headers, telefono="1810")
        medida = self._crear_medida(client, admin_headers)
        articulo1 = self._crear_articulo(client, admin_headers, cat["id"], "ArtCantC")
        articulo2 = self._crear_articulo(client, admin_headers, cat["id"], "ArtCantD")
        ids: list[str] = []
        for articulo in [articulo1, articulo2]:
            r = client.post(
                "/api/v1/listas-precios",
                json={
                    "proveedor_id": proveedor["id"],
                    "items": [
                        {"articulo": {"id": articulo["id"]}, "medida": {"id": medida["id"]}, "precio_lista": 10}
                    ],
                },
                headers=admin_headers,
            )
            assert r.status_code == 201, r.text
            ids.append(r.json()[0]["id"])
        client.delete(f"/api/v1/listas-precios/{ids[0]}", headers=admin_headers)
        r = client.get("/api/v1/listas-precios/cantidad-por-proveedor", headers=admin_headers)
        assert r.status_code == 200
        body = r.json()
        assert [(i["proveedor"]["id"], i["cantidad"]) for i in body] == [(proveedor["id"], 1)]
        assert body[0]["por_categoria"] == [{"categoria": {"id": cat["id"], "nombre": "CANTCAT2", "descripcion": None}, "cantidad": 1}]

    def test_cantidad_por_categoria_excluye_articulos_sin_categoria(self, client, admin_headers):
        proveedor = self._crear_proveedor(client, admin_headers, nombre="ProvSinCat", telefono="1820")
        r = client.post(
            "/api/v1/listas-precios",
            json={
                "proveedor_id": proveedor["id"],
                "items": [{"articulo": {"nombre": "Tuerca M8"}, "medida": {"unidad_medida": "un", "medida": "1"}, "precio_lista": 5}],
            },
            headers=admin_headers,
        )
        assert r.status_code == 201, r.text
        r = client.get("/api/v1/listas-precios/cantidad-por-proveedor", headers=admin_headers)
        assert r.status_code == 200
        body = r.json()
        assert len(body) == 1
        assert body[0]["proveedor"]["id"] == proveedor["id"]
        assert body[0]["cantidad"] == 1
        assert body[0]["por_categoria"] == []

    def test_listar_excluye_eliminados(self, client, admin_headers):
        cat = self._crear_categoria(client, admin_headers)
        proveedor = self._crear_proveedor(client, admin_headers, telefono="1700")
        articulo = self._crear_articulo(client, admin_headers, cat["id"], "Cinta")
        medida = self._crear_medida(client, admin_headers)
        creado = client.post(
            "/api/v1/listas-precios",
            json={
                "proveedor_id": proveedor["id"],
                "items": [
                    {"articulo": {"id": articulo["id"]}, "medida": {"id": medida["id"]}, "precio_lista": 10}
                ],
            },
            headers=admin_headers,
        ).json()[0]
        client.delete(f"/api/v1/listas-precios/{creado['id']}", headers=admin_headers)
        r = client.get("/api/v1/listas-precios", headers=admin_headers)
        assert r.status_code == 200
        assert r.json() == []

    def test_eliminar_baja_logica(self, client, admin_headers):
        cat = self._crear_categoria(client, admin_headers)
        proveedor = self._crear_proveedor(client, admin_headers, telefono="1800")
        articulo = self._crear_articulo(client, admin_headers, cat["id"], "Tornillo2")
        medida = self._crear_medida(client, admin_headers)
        creado = client.post(
            "/api/v1/listas-precios",
            json={
                "proveedor_id": proveedor["id"],
                "items": [
                    {"articulo": {"id": articulo["id"]}, "medida": {"id": medida["id"]}, "precio_lista": 10}
                ],
            },
            headers=admin_headers,
        ).json()[0]
        r = client.delete(f"/api/v1/listas-precios/{creado['id']}", headers=admin_headers)
        assert r.status_code == 204
        assert client.get(f"/api/v1/listas-precios/{creado['id']}", headers=admin_headers).status_code == 404

    def test_eliminar_registro_inexistente(self, client, admin_headers):
        r = client.delete(f"/api/v1/listas-precios/{uuid.uuid4()}", headers=admin_headers)
        assert r.status_code == 404
