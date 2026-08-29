import uuid


class TestProveedorCrud:
    def _crear_categoria(self, client, headers, nombre="HERRAMIENTAS"):
        r = client.post("/api/v1/categorias", json={"nombre": nombre}, headers=headers)
        assert r.status_code == 201, r.text
        return r.json()

    def test_crear_proveedor_con_categorias(self, client, admin_headers):
        cat = self._crear_categoria(client, admin_headers)
        r = client.post(
            "/api/v1/proveedores",
            json={
                "nombre": "Juan",
                "apellido": "Perez",
                "telefono": "111",
                "direccion": "Calle 1",
                "categoria_ids": [cat["id"]],
            },
            headers=admin_headers,
        )
        assert r.status_code == 201, r.text
        body = r.json()
        assert body["nombre"] == "Juan"
        assert body["apellido"] == "Perez"
        assert body["telefono"] == "111"
        assert body["direccion"] == "Calle 1"
        assert len(body["categorias"]) == 1
        assert body["categorias"][0]["id"] == cat["id"]

    def test_crear_proveedor_sin_categorias(self, client, admin_headers):
        r = client.post(
            "/api/v1/proveedores",
            json={"nombre": "Ana", "apellido": "Lopez", "telefono": "222"},
            headers=admin_headers,
        )
        assert r.status_code == 201, r.text
        assert r.json()["categorias"] == []

    def test_crear_telefono_duplicado(self, client, admin_headers):
        client.post(
            "/api/v1/proveedores",
            json={"nombre": "Juan", "apellido": "Perez", "telefono": "333"},
            headers=admin_headers,
        )
        r = client.post(
            "/api/v1/proveedores",
            json={"nombre": "Otro", "apellido": "Nombre", "telefono": "333"},
            headers=admin_headers,
        )
        assert r.status_code == 409

    def test_crear_nombre_apellido_duplicado(self, client, admin_headers):
        client.post(
            "/api/v1/proveedores",
            json={"nombre": "Juan", "apellido": "Perez", "telefono": "444"},
            headers=admin_headers,
        )
        r = client.post(
            "/api/v1/proveedores",
            json={"nombre": "Juan", "apellido": "Perez", "telefono": "555"},
            headers=admin_headers,
        )
        assert r.status_code == 409

    def test_crear_categoria_inexistente(self, client, admin_headers):
        r = client.post(
            "/api/v1/proveedores",
            json={
                "nombre": "Juan",
                "apellido": "Perez",
                "telefono": "666",
                "categoria_ids": [str(uuid.uuid4())],
            },
            headers=admin_headers,
        )
        assert r.status_code == 400

    def test_listar_proveedores_con_categorias(self, client, admin_headers):
        cat = self._crear_categoria(client, admin_headers)
        client.post(
            "/api/v1/proveedores",
            json={"nombre": "Juan", "apellido": "Perez", "telefono": "777", "categoria_ids": [cat["id"]]},
            headers=admin_headers,
        )
        client.post(
            "/api/v1/proveedores",
            json={"nombre": "Ana", "apellido": "Lopez", "telefono": "888"},
            headers=admin_headers,
        )
        r = client.get("/api/v1/proveedores", headers=admin_headers)
        assert r.status_code == 200
        body = r.json()
        assert len(body) == 2
        con_cat = next(p for p in body if p["categorias"])
        assert con_cat["categorias"][0]["id"] == cat["id"]

    def test_listar_excluye_eliminados(self, client, admin_headers):
        creado = client.post(
            "/api/v1/proveedores",
            json={"nombre": "Juan", "apellido": "Perez", "telefono": "999"},
            headers=admin_headers,
        ).json()
        client.delete(f"/api/v1/proveedores/{creado['id']}", headers=admin_headers)
        r = client.get("/api/v1/proveedores", headers=admin_headers)
        assert r.status_code == 200
        assert r.json() == []

    def test_obtener_proveedor_por_id(self, client, admin_headers):
        cat = self._crear_categoria(client, admin_headers)
        creado = client.post(
            "/api/v1/proveedores",
            json={"nombre": "Juan", "apellido": "Perez", "telefono": "1010", "categoria_ids": [cat["id"]]},
            headers=admin_headers,
        ).json()
        r = client.get(f"/api/v1/proveedores/{creado['id']}", headers=admin_headers)
        assert r.status_code == 200
        assert r.json()["telefono"] == "1010"
        assert r.json()["categorias"][0]["id"] == cat["id"]

    def test_obtener_proveedor_inexistente(self, client, admin_headers):
        r = client.get(f"/api/v1/proveedores/{uuid.uuid4()}", headers=admin_headers)
        assert r.status_code == 404

    def test_actualizar_proveedor(self, client, admin_headers):
        creado = client.post(
            "/api/v1/proveedores",
            json={"nombre": "Juan", "apellido": "Perez", "telefono": "1111"},
            headers=admin_headers,
        ).json()
        r = client.put(
            f"/api/v1/proveedores/{creado['id']}",
            json={"telefono": "2222"},
            headers=admin_headers,
        )
        assert r.status_code == 200, r.text
        assert r.json()["telefono"] == "2222"

    def test_actualizar_proveedor_inexistente(self, client, admin_headers):
        r = client.put(
            f"/api/v1/proveedores/{uuid.uuid4()}",
            json={"telefono": "3333"},
            headers=admin_headers,
        )
        assert r.status_code == 404

    def test_actualizar_telefono_duplicado(self, client, admin_headers):
        client.post(
            "/api/v1/proveedores",
            json={"nombre": "Ana", "apellido": "Lopez", "telefono": "4444"},
            headers=admin_headers,
        )
        creado = client.post(
            "/api/v1/proveedores",
            json={"nombre": "Juan", "apellido": "Perez", "telefono": "5555"},
            headers=admin_headers,
        ).json()
        r = client.put(
            f"/api/v1/proveedores/{creado['id']}",
            json={"telefono": "4444"},
            headers=admin_headers,
        )
        assert r.status_code == 409

    def test_actualizar_categorias(self, client, admin_headers):
        cat1 = self._crear_categoria(client, admin_headers, "MADERA")
        cat2 = self._crear_categoria(client, admin_headers, "PINTURAS")
        creado = client.post(
            "/api/v1/proveedores",
            json={"nombre": "Juan", "apellido": "Perez", "telefono": "6666", "categoria_ids": [cat1["id"]]},
            headers=admin_headers,
        ).json()
        r = client.put(
            f"/api/v1/proveedores/{creado['id']}",
            json={"categoria_ids": [cat2["id"]]},
            headers=admin_headers,
        )
        assert r.status_code == 200, r.text
        categorias = r.json()["categorias"]
        assert len(categorias) == 1
        assert categorias[0]["id"] == cat2["id"]

    def test_eliminar_proveedor_baja_logica(self, client, admin_headers):
        creado = client.post(
            "/api/v1/proveedores",
            json={"nombre": "Juan", "apellido": "Perez", "telefono": "7777"},
            headers=admin_headers,
        ).json()
        r = client.delete(f"/api/v1/proveedores/{creado['id']}", headers=admin_headers)
        assert r.status_code == 204
        assert client.get(f"/api/v1/proveedores/{creado['id']}", headers=admin_headers).status_code == 404
        assert client.get("/api/v1/proveedores", headers=admin_headers).json() == []
