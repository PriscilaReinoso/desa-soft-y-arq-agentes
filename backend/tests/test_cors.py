from app.main import app


class TestCORS:
    def test_preflight_login_origen_autorizado(self, client):
        r = client.options(
            "/api/v1/auth/login",
            headers={
                "Origin": "http://localhost:5173",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "content-type",
            },
        )
        assert r.status_code == 200
        assert r.headers.get("access-control-allow-origin") == "http://localhost:5173"
        assert "POST" in r.headers.get("access-control-allow-methods", "")
        assert "authorization" in r.headers.get("access-control-allow-headers", "").lower()

    def test_preflight_login_origen_no_autorizado(self, client):
        r = client.options(
            "/api/v1/auth/login",
            headers={
                "Origin": "https://evil.example.com",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "content-type",
            },
        )
        assert r.status_code == 400
        assert "access-control-allow-origin" not in r.headers

    def test_response_incluye_cabecera_cors(self, client):
        r = client.get(
            "/api/v1/roles",
            headers={"Origin": "http://127.0.0.1:5173"},
        )
        assert r.headers.get("access-control-allow-origin") == "http://127.0.0.1:5173"

    def test_app_registra_cors_middleware(self):
        middleware_classes = [m.cls.__name__ for m in app.user_middleware]
        assert "CORSMiddleware" in middleware_classes
