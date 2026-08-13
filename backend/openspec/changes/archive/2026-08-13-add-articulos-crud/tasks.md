## 1. Modelos

- [x] 1.1 Crear `app/models/categoria.py` (tabla `categoria`: id UUID, nombre único, descripción, timestamps, `deleted_at`)
- [x] 1.2 Crear `app/models/articulo.py` (tabla `articulo`: id UUID, nombre único, descripción, categoria_id FK, timestamps, `deleted_at`)
- [x] 1.3 Declarar relación bidireccional `Categoria.articulos` (1:N) y `Articulo.categoria` (N:1)

## 2. Schemas

- [x] 2.1 Crear `app/schemas/categoria.py` con esquemas de creación, actualización, respuesta y listado
- [x] 2.2 Crear `app/schemas/articulo.py` con esquemas de creación, actualización, respuesta y listado

## 3. Repositorios

- [x] 3.1 Crear `app/repositories/categoria_repository.py`: CRUD + consultas filtrando `deleted_at`
- [x] 3.2 Crear `app/repositories/articulo_repository.py`: CRUD + consulta por nombre + filtrando `deleted_at`

## 4. Services

- [x] 4.1 Crear `app/services/categoria_service.py`: reglas de negocio (unicidad de nombre, 409; validación de existencia, 404)
- [x] 4.2 Crear `app/services/articulo_service.py`: reglas de negocio (validación de categoría, unicidad de nombre, 409)

## 5. Routers

- [x] 5.1 Crear `app/api/v1/categorias.py`: endpoints GET list, POST
- [x] 5.2 Crear `app/api/v1/articulos.py`: endpoints GET list, POST, GET by id, PUT, DELETE
- [x] 5.3 Registrar los routers en `app/main.py`

## 6. Migraciones y Pruebas

- [x] 6.1 Generar y aplicar la migración Alembic para `categoria` y `articulo`
- [x] 6.2 Escribir pruebas pytest del CRUD de categorías (crear, listar, unicidad, baja lógica si aplica)
- [x] 6.3 Escribir pruebas pytest del CRUD de artículos (incluye validación de categoría, unicidad de nombre, baja lógica)
- [x] 6.4 Ejecutar `pytest` y corregir fallos
