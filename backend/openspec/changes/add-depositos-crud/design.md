## Context

La capa por capas del backend está asentada (ver change `add-rol-usuario-crud`
archivado). Este change agrega la entidad `deposito` definida en
`docs/db_schema.md`, siguiendo el mismo patrón de `rol`. El depósito es el
padre de `espacio` (1:N), pero ese CRUD se implementa en su propio change.

## Goals / Non-Goals

**Goals:**
- Modelo `Deposito` en singular, tabla `deposito`, con soft delete y
  timestamps de auditoría.
- CRUD completo de depósitos en la capa correspondiente.
- Relación `Deposito.espacios` (1:N) declarada para uso posterior.

**Non-Goals:**
- CRUD de espacios (change `add-espacios-crud`).
- Mantenimiento manual de `cantidad_espacios` por el usuario (se sincroniza
  desde el CRUD de espacios).

## Decisions

### 1. `cantidad_espacios` no es administrable directamente
El campo se inicializa en 0 al crear y se mantiene sincronizado por el change
`add-espacios-crud` (incremento/decremento). No aparece en los esquemas de
creación ni de actualización; sí en la salida.

### 2. Soft delete con filtro explícito en el Repository
Se sigue el patrón de `RolRepository`: filtro `deleted_at.is_(None)` y baja
lógica con `deleted_at = utcnow()`.

### 3. Relación con `Espacio` se declara en su propio change
`Deposito.espacios` (1:N) se declara en `add-espacios-crud`, cuando el modelo
`Espacio` ya exista. Declararla en este change con forward reference a una
clase aún no mapeada rompe la configuración del mapper de SQLAlchemy al
importar los modelos.

### 4. Schemas Pydantic por operación
`DepositoCreate`, `DepositoUpdate` y `DepositoOut`, siguiendo
`app/schemas/rol.py` (`ConfigDict(from_attributes=True)`).

## Risks / Trade-offs

- **Relación `Deposito.espacios` diferida** → el modelo `Deposito` no expone la
  colección hasta el change `add-espacios-crud`. Mitigación: sin impacto en el
  CRUD de depósitos; se completa la bidireccionalidad cuando exista `Espacio`.
- **`cantidad_espacios` desincronizado** → si el CRUD de espacios no ajusta el
  contador, el dato queda obsoleto. Mitigación: la sincronización es requisito
  del change `add-espacios-crud` y se cubre con pruebas.
