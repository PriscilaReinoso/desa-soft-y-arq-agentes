# AGENTS.md

Instrucciones globales para los agentes de opencode en el backend del
**Sistema de Gestión de Inventario para Ferretería**.

## Descripción del proyecto

API REST para la gestión de inventario de una ferretería. Administra
artículos, depósitos, ventas, proveedores y listas de precios; expone
módulos de preventas y presupuestos (exportables a PDF), se integrara con un
asistente inteligente para consultas sobre inventario, productos similares y
sugerencias de compra.

## Stack tecnológico

- Python 3.12, FastAPI, Pydantic v2.
- SQLAlchemy 2.0 (ORM) + Alembic (migraciones).
- PostgreSQL con pgvector (búsqueda semántica del asistente).
- Autenticación JWT con roles `ADMIN` y `CONSULTOR`.
- Pytest para pruebas.
- Docker para contenerización.

## Estructura del proyecto

```
app/
  main.py              # Punto de entrada de FastAPI. Inicializa la aplicación y registra los routers.
  api/
    v1/                # Endpoints REST organizados por versión (users.py, auth.py, products.py, etc.).
  models/              # Modelos SQLAlchemy que representan las tablas de PostgreSQL.
  schemas/             # Modelos Pydantic para validación de requests y responses.
  services/            # Lógica de negocio. Coordina reglas de negocio y llamadas a repositorios.
  repositories/        # Capa de acceso a datos. Encapsula las consultas a la base de datos (opcional).
  core/
    config.py          # Configuración de la aplicación y variables de entorno.
    database.py        # Configuración del motor SQLAlchemy, sesiones y conexión a PostgreSQL.
    security.py        # Autenticación, JWT, hashing de contraseñas y utilidades de seguridad.
    dependencies.py    # Dependencias reutilizables para inyección en FastAPI.
  exceptions/          # Excepciones personalizadas y manejadores globales de errores.
  middleware/          # Middlewares personalizados (logging, auditoría, autenticación, etc.).
  utils/               # Funciones auxiliares y utilidades (CSV, Excel, PDF, emails, helpers, etc.).
alembic/               # Migraciones y control de versiones del esquema de la base de datos.
tests/                 # Pruebas unitarias e integración con pytest.
.env                   # Variables de entorno para desarrollo (no versionar).
.env.example           # Ejemplo de variables de entorno requeridas.
Dockerfile             # Imagen Docker de la aplicación.
docker-compose.yml     # Orquestación de servicios (API, PostgreSQL, pgAdmin, etc.).
README.md              # Documentación del proyecto e instrucciones de instalación.
```

## Convenciones

- Nombres descriptivos en inglés; entidades de dominio en inglés:
- Modelos en singular (`class Article`), tablas en plural (`articles`).
- Comentarios solo cuando aportan valor; no repetir el código.
- Mantener cada archivo con una única responsabilidad.
- No escribir secretos en código ni en archivos versionados; usar variables
  de entorno.

## Arquitectura

La aplicación sigue una arquitectura por capas:

HTTP Request
    ↓
Router (FastAPI)
    ↓
Service (Reglas de negocio)
    ↓
Repository (Acceso a datos)
    ↓
SQLAlchemy
    ↓
PostgreSQL

Los routers nunca deben acceder directamente a la base de datos.
Toda regla de negocio pertenece a Services.
Repositories únicamente realizan operaciones CRUD y consultas.

## Flujo de trabajo

1. Leer el archivo objetivo y su contexto antes de editar.
2. Seguir las convenciones de estructura y de nombres.
3. Ejecutar los tests del backend antes y después de los cambios.
4. Verificar que no se rompan otras partes del proyecto.
5. No ejecutar `git commit` ni `git push` salvo que el usuario lo pida.

## Comandos útiles

- Instalar dependencias: `pip install -r requirements.txt`.
- Correr la API localmente: `uvicorn app.main:app --reload`.
- Ejecutar tests: `pytest`.
- Generar migración: `alembic revision --autogenerate -m "<descripcion>"`.
- Aplicar migraciones: `alembic upgrade head`.


## Herramientas disponibles

- Subagentes en `.opencode/agent/`: revisores y diseñadores especializados en
  el backend.
- Skills en `.opencode/skill/`: blueprints para migraciones
  Alembic y tests pytest.
- Comandos personalizados en `.opencode/command/`.

## Seguridad

- Nunca escribir secretos o claves en código ni en archivos versionados.
- No registrar claves de API ni tokens en logs.
- `JWT_SECRET` y credenciales de base de datos van por variables de entorno
  (`.env` no versionado).
