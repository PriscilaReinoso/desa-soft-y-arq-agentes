## Context

La capa por capas del backend está asentada (ver change `add-rol-usuario-crud`
archivado). Este change agrega la entidad `medida` definida en
`docs/db_schema.md`, siguiendo el mismo patrón de modelo, schema, repository,
service y router de `rol`.

## Goals / Non-Goals

**Goals:**
- Modelo `Medida` en singular, tabla `medida`, con soft delete y timestamps de
  auditoría.
- CRUD completo de medidas en la capa correspondiente.
- Unicidad de la combinación `unidad_medida` + `medida`.

**Non-Goals:**
- CRUD de artículos, depósitos, espacios o inventario (cambios separados).

## Decisions

### 1. Unicidad compuesta validada en el Service
El esquema define `UNIQUE(unidad_medida, medida)`. La constraint se materializa
en el modelo (tabla) y además se valida en el Service (HTTP 409) consultando
por la combinación completa, incluyendo registros eliminados lógicamente.

### 2. Soft delete con filtro explícito en el Repository
Se sigue el patrón de `RolRepository`: filtro `deleted_at.is_(None)` en todas
las consultas y baja lógica con `deleted_at = utcnow()`.

### 3. Schemas Pydantic por operación
`MedidaCreate`, `MedidaUpdate` y `MedidaOut`, siguiendo
`app/schemas/rol.py` (`ConfigDict(from_attributes=True)`).

## Risks / Trade-offs

- **Soft delete + UNIQUE compuesto** → una medida eliminada lógicamente
  conserva su combinación y bloquea la re-creación. Mitigación: validación en
  el Service contra todos los registros; índice parcial como mejora futura si
  el negocio lo exige.
