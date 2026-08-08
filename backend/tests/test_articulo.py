class TestArticuloCrud:
    def _crear_categoria(self, client, headers, nombre="HERRAMIENTAS"):
        r = client.post("/api/v1/categorias", json={"nombre": nombre}, headers=headers)
        assert r.status_code == 201, r.text
        return r.json()

    def _crear_articulo(self, client, headers, categoria_id, nombre="Martillo", descripcion=None):
        payload = {"nombre": nombre, "categoria_id": categoria_id}
        if descripcion is not None:
            payload["descripcion"] = descripcion
        return client.post("/api/v1/articulos", json=payload, headers=headers)

    def test_crear_articulo_exitoso(self, client, admin_headers):
        cat = self._crear_categoria(client, admin_headers)
        r = self._crear_articulo(client, admin_headers, cat["id"], nombre="Martillo", descripcion="16 oz")
        assert r.status_code == 201
        body = r.json()
        assert body["nombre"] == "Martillo"
        assert body["descripcion"] == "16 oz"
        assert body["categoria_id"] == cat["id"]
        assert "id" in body

    def test_crear_articulo_nombre_duplicado(self, client, admin_headers):
        cat = self._crear_categoria(client, admin_headers)
        self._crear_articulo(client, admin_headers, cat["id"], nombre="Martillo")
        r = self._crear_articulo(client, admin_headers, cat["id"], nombre="Martillo")
        assert r.status_code == 409

    def test_crear_articulo_categoria_inexistente(self, client, admin_headers):
        r = self._crear_articulo(
            client, admin_headers, "00000000-0000-0000-0000-000000000000", nombre="Martillo"
        )
        assert r.status_code == 400

    def test_crear_articulo_nombre_faltante(self, client, admin_headers):
        cat = self._crear_categoria(client, admin_headers)
        r = client.post(
            "/api/v1/articulos",
            json={"categoria_id": cat["id"]},
            headers=admin_headers,
        )
        assert r.status_code == 422

    def test_listar_articulos(self, client, admin_headers):
        cat = self._crear_categoria(client, admin_headers)
        self._crear_articulo(client, admin_headers, cat["id"], nombre="Martillo")
        self._crear_articulo(client, admin_headers, cat["id"], nombre="Serrucho")
        r = client.get("/api/v1/articulos", headers=admin_headers)
        assert r.status_code == 200
        nombres = {x["nombre"] for x in r.json()}
        assert {"Martillo", "Serrucho"} <= nombres

    def test_obtener_articulo_por_id(self, client, admin_headers):
        cat = self._crear_categoria(client, admin_headers)
        creado = self._crear_articulo(client, admin_headers, cat["id"], nombre="Martillo").json()
        r = client.get(f"/api/v1/articulos/{creado['id']}", headers=admin_headers)
        assert r.status_code == 200
        assert r.json()["nombre"] == "Martillo"

    def test_obtener_articulo_inexistente(self, client, admin_headers):
        r = client.get("/api/v1/articulos/00000000-0000-0000-0000-000000000000", headers=admin_headers)
        assert r.status_code == 404

    def test_actualizar_articulo(self, client, admin_headers):
        cat = self._crear_categoria(client, admin_headers)
        creado = self._crear_articulo(client, admin_headers, cat["id"], nombre="Martillo").json()
        r = client.put(
            f"/api/v1/articulos/{creado['id']}",
            json={"descripcion": "Nueva desc"},
            headers=admin_headers,
        )
        assert r.status_code == 200
        assert r.json()["descripcion"] == "Nueva desc"

    def test_actualizar_articulo_conflicto_nombre(self, client, admin_headers):
        cat = self._crear_categoria(client, admin_headers)
        self._crear_articulo(client, admin_headers, cat["id"], nombre="Martillo")
        creado = self._crear_articulo(client, admin_headers, cat["id"], nombre="Serrucho").json()
        r = client.put(
            f"/api/v1/articulos/{creado['id']}",
            json={"nombre": "Martillo"},
            headers=admin_headers,
        )
        assert r.status_code == 409

    def test_actualizar_articulo_categoria_inexistente(self, client, admin_headers):
        cat = self._crear_categoria(client, admin_headers)
        creado = self._crear_articulo(client, admin_headers, cat["id"], nombre="Martillo").json()
        r = client.put(
            f"/api/v1/articulos/{creado['id']}",
            json={"categoria_id": "00000000-0000-0000-0000-000000000000"},
            headers=admin_headers,
        )
        assert r.status_code == 400

    def test_eliminar_articulo_baja_logica(self, client, admin_headers):
        cat = self._crear_categoria(client, admin_headers)
        creado = self._crear_articulo(client, admin_headers, cat["id"], nombre="Martillo").json()
        r = client.delete(f"/api/v1/articulos/{creado['id']}", headers=admin_headers)
        assert r.status_code == 204
        assert client.get(f"/api/v1/articulos/{creado['id']}", headers=admin_headers).status_code == 404
        nombres = {x["nombre"] for x in client.get("/api/v1/articulos", headers=admin_headers).json()}
        assert "Martillo" not in nombres
