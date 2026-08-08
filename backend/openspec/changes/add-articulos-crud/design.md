## Context

El backend ya tiene la capa por capas asentada (ver change `add-rol-usuario-crud`
archivado): `app/core/`, `app/models/`, `app/schemas/`, `app/repositories/`,
`app/services/` y `app/api/v1/` con routers que autentican por JWT y
restringen mutaciones a `ADMIN`. Las entidades `rol` y `usuario` ya existen y
sirven de patrón. Este change agrega `articulo` y su entidad soporte
`categoria` siguiendo `docs/db_schema.md`.

## Goals / Non-Goals

**Goals:**
- Modelos `Categoria` y `Articulo` en singular, tablas `categoria` y
  `articulo`, con soft delete y timestamps de auditoría.
- CRUD completo de artículos y CRUD mínimo de categorías (listar y crear) en
  la capa correspondiente.
- Relaciones bidireccionales `Categoria.articulos` (1:N) y
  `Articulo.categoria` (N:1).
- Validación de `categoria_id` existente y de unicidad de `articulo.nombre`.

**Non-Goals:**
- CRUD de `medida`, `espacio`, `deposito` e `inventario` (cambios separados).
- Alta compuesta de inventario (change `add-alta-inventario-compuesto`).

## Decisions

### 1. Se incluye un CRUD mínimo de categorías en este change
`articulo.categoria_id` es FK obligatoria y no existe ningún otro caso de uso
que administre categorías. Sin ellas no se pueden crear artículos. Se agrega
`categorias-crud` con listado y alta (suficiente para alimentar el selector);
si más adelante el negocio lo exige, se extiende a CRUD completo en un change
nuevo.

### 2. Soft delete con filtro explícito en el Repository
Se sigue el patrón de `RolRepository`: toda consulta filtra
`deleted_at.is_(None)` y la baja lógica setea `deleted_at = utcnow()`. El
mixin de soft delete se deja como mejora futura.

### 3. Unicidad y referencias validadas en el Service
- `articulo.nombre`: unique a nivel base y validado en el Service (HTTP 409)
  contra todos los registros, incluidos los eliminados lógicamente.
- `categoria_id`: se valida existencia vía repository (HTTP 400 si no existe).

### 4. Schemas Pydantic por operación
`ArticuloCreate`, `ArticuloUpdate`, `ArticuloOut` y `CategoriaCreate`,
`CategoriaOut`, siguiendo el patrón de `app/schemas/rol.py`
(`ConfigDict(from_attributes=True)`, timestamps en las salidas).

### 5. Relaciones bidireccionales
`Articulo.categoria` y `Categoria.articulos` con `back_populates`.

## Risks / Trade-offs

- **Soft delete + UNIQUE en `articulo.nombre`** → un artículo eliminado
  lógicamente conserva el nombre y bloquea su re-creación. Mitigación: se
  valida el conflicto en el Service contra todos los registros y se evalúa un
  índice parcial (`WHERE deleted_at IS NULL`) si el negocio lo requiere.
- **`categoria` con CRUD mínimo** → no hay endpoint para actualizar o borrar
  categorías. Mitigación: el alcance cubre el caso de uso actual; el resto se
  puede agregar en un change posterior sin romper compatibilidad.
