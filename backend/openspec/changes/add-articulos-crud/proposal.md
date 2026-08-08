## Why

El sistema necesita administrar los artículos a la venta en la ferretería. Sin
un CRUD de artículos no es posible componer el inventario ni las listas de
precios, que dependen de la entidad `articulo` definida en `docs/db_schema.md`.

## What Changes

- Crear el modelo `Articulo` (tabla `articulo`) con `nombre` único,
  `descripcion`, `categoria_id` FK y timestamps de auditoría (`created_at`,
  `updated_at`, `deleted_at`).
- Crear el modelo `Categoria` (tabla `categoria`) como entidad soporte: los
  artículos requieren `categoria_id` y no existe otro caso de uso que la
  administre, por lo que este cambio incluye su CRUD mínimo (listar y crear).
- Implementar la capa completa por responsabilidad: Router → Service →
  Repository → SQLAlchemy, con modelos en singular y relaciones
  bidireccionales (`Articulo.categoria`, `Categoria.articulos`).
- Endpoints REST en `api/v1/articulos` (listar, crear, obtener por id,
  actualizar, baja lógica) y `api/v1/categorias` (listar y crear).
- Borrado lógico vía `deleted_at`; las listas excluyen registros eliminados.
- Migración Alembic que materializa las tablas `categoria` y `articulo`.
- Pruebas con pytest para el CRUD de artículos y de categorías.

## Capabilities

### New Capabilities
- `articulos-crud`: CRUD completo de la entidad artículo (listado, detalle,
  alta, actualización y baja lógica) con asignación de categoría.
- `categorias-crud`: CRUD mínimo de la entidad categoría (listado y alta) que
  sustenta la asignación de `categoria_id` a los artículos.

### Modified Capabilities

## Impact

- Código: `app/models/categoria.py`, `app/models/articulo.py`, nuevos
  `repositories/`, `services/`, `schemas/` y `app/api/v1/articulos.py` +
  `app/api/v1/categorias.py`, registro en `app/main.py`.
- Base de datos: nuevas tablas `categoria` y `articulo` (migración Alembic).
- Seguridad: los endpoints requieren JWT; alta y modificación restringidas a
  `ADMIN`.
- Pruebas: nuevas suites para ambos CRUDs.
