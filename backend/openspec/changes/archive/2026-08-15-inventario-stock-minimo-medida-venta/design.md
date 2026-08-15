## Context

Ver proposal.md — Why. El modelo `Inventario` actual tiene una única FK a
`medida` (`medida_id`). Agregar `medida_venta_id` introduce una segunda FK a la
misma tabla, por lo que las relationships de SQLAlchemy en `Inventario` y
`Medida` deben desambiguarse con `foreign_keys`. La capa de servicios ya valida
referencias (artículo, medida, espacio) y el alta compuesta ya implementa
rollback transaccional; se reutilizan esos patrones.

## Goals / Non-Goals

**Goals:**
- Soportar `minimo_stock` y `medida_venta_id` en modelo, migración, CRUD y alta.
- Mantener consistencia de shape de la API: id en request, objeto anidado en
  response (igual que `medida`/`espacio`).
- Mantener el rollback del alta compuesta ante medida de venta inválida.

**Non-Goals:**
- Lógica de reposición/sugerencias de compra basada en `minimo_stock`.
- Permitir crear una medida de venta nueva dentro del alta compuesta (solo por
  id existente).
- Cambios en `docs/db_schema.md` (ya documenta los campos).

## Decisions

- **`minimo_stock` NOT NULL DEFAULT 0 con CHECK >= 0.** Se valida en DB
  (`ck_inventario_minimo_stock_positivo`) y en Pydantic (`Field(ge=0)`), igual
  que `stock`. Default 0 para no romper los ítems existentes.
  *Alternativa descartada:* sin CHECK — inconsistente con las demás columnas de
  stock/precio.
- **`medida_venta_id` nullable, FK a `medida.id`, sin ON DELETE.** El borrado
  es lógico (soft delete) en todo el sistema; se valida existencia/no eliminada
  en el service con `MedidaRepository.get`. `null` significa "el precio no se
  rige por una unidad de venta".
  *Alternativa descartada:* columna NOT NULL con medida por defecto — no hay
  valor por defecto semántico válido.
- **Desambiguación de relationships con `foreign_keys` explícitas.**
  `Inventario.medida` → `foreign_keys=[medida_id]`;
  `Inventario.medida_venta` → `foreign_keys=[medida_venta_id]`;
  `Medida.inventarios` y `Medida.inventarios_venta` equivalentes. Sin esto,
  SQLAlchemy lanza error de ambigüedad por las dos FKs a `medida`.
- **Migración Alembic manual.** `add_column` para `minimo_stock` con
  `server_default="0"` y luego `alter_column(server_default=None)` para que el
  backfill no deje un server_default que difiera del modelo (patrón de `stock`).
  Índice `ix_inventario_medida_venta_id` y FK con nombre explícito.
- **`medida_venta` en response como objeto anidado (`MedidaOut | None`).** Los
  request (create/update/alta) reciben `medida_venta_id`; las responses
  devuelven `medida_venta`. Consistente con `medida`/`espacio`.
  *Alternativa descartada:* devolver `medida_venta_id` plano — rompe la
  convención del resto del CRUD.
- **Update permite limpiar con `null`.** Se usa `model_fields_set` para
  distinguir "no enviado" de "enviado null", igual que `espacio_id`.

## Risks / Trade-offs

- [Dos FKs a `medida`: riesgo de relationships ambiguas o cargas incorrectas] →
  Mitigación: `foreign_keys` explícitas en ambos modelos y eager-load con
  `selectinload(Inventario.medida_venta)`.
- [Soft delete de `medida`: un ítem puede quedar con `medida_venta_id` a una
  medida eliminada] → Mitigación: validación al crear/actualizar; la medida
  eliminada queda excluida por el repository. (Mismo trade-off que ya existe
  para `medida_id`.)
- [`minimo_stock` con CHECK en SQLite de tests] → Mitigación: el CHECK es
  compatible con SQLite; los tests validan el 422 vía Pydantic.

## Migration Plan

1. Aplicar migración nueva sobre `inventario` (add columns, FK, índice, CHECK).
2. Rollback: `downgrade()` elimina CHECK, índice, FK y columnas.
3. No requiere backfill de datos: `minimo_stock` default 0, `medida_venta_id`
   null en los ítems existentes.

## Open Questions

- Ninguna para la implementación. Las respuestas de shape y validación fueron
  definidas con el usuario.
