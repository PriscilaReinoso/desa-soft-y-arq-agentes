## Context

La capa por capas del backend está asentada (ver change `add-rol-usuario-crud`
archivado). Este change agrega la entidad `espacio` de `docs/db_schema.md`,
que pertenece a un depósito (N:1). Depende de que exista la tabla `deposito`
(change `add-depositos-crud`).

## Goals / Non-Goals

**Goals:**
- Modelo `Espacio` en singular, tabla `espacio`, con soft delete y timestamps
  de auditoría.
- CRUD completo de espacios en la capa correspondiente.
- Validación de `deposito_id` existente y no eliminado.
- Sincronización de `deposito.cantidad_espacios` al crear y eliminar espacios.

**Non-Goals:**
- Gestión de la grilla del inventario (fila/columna de ítems).
- Validación de que un espacio no tenga ítems antes de darlo de baja.

## Decisions

### 1. Sincronización de `cantidad_espacios` en el Service
`deposito.cantidad_espacios` es un contador denormalizado definido en el
esquema. El Service de Espacio lo incrementa al crear y lo decrementa al
eliminar lógicamente, dentro de la misma sesión de base de datos. Se usa el
repositorio de depósito existente para leer y persistir el contador.

### 2. Soft delete con filtro explícito en el Repository
Se sigue el patrón de `RolRepository`: filtro `deleted_at.is_(None)` y baja
lógica con `deleted_at = utcnow()`.

### 3. Relaciones bidireccionales
`Espacio.deposito` (N:1) y `Deposito.espacios` (1:N) con `back_populates`,
completando la relación declarada en el change `add-depositos-crud`.

### 4. Schemas Pydantic por operación
`EspacioCreate`, `EspacioUpdate` y `EspacioOut`, siguiendo
`app/schemas/rol.py` (`ConfigDict(from_attributes=True)`).

## Risks / Trade-offs

- **Baja lógica de espacios con ítems de inventario** → al no borrar
  físicamente, los ítems conservan la referencia histórica; el inventario sigue
  mostrando la ubicación aunque el espacio esté inactivo. Mitigación: aceptado
  por diseño; se revisará si el negocio exige reubicación previa.
- **Contador denormalizado** → puede desincronizarse si se edita
  `cantidad_espacios` por otra vía. Mitigación: solo se modifica desde el
  Service de Espacio.
