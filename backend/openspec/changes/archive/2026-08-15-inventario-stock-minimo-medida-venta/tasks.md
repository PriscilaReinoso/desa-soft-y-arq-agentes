## 1. Modelo y relationships

- [x] 1.1 En `app/models/inventario.py`, agregar `minimo_stock: Mapped[int]` (Integer, default 0, nullable=False) y `medida_venta_id: Mapped[uuid.UUID | None]` (Uuid, FK `medida.id`, nullable=True)
- [x] 1.2 En `app/models/inventario.py`, agregar `CheckConstraint("minimo_stock >= 0", name="ck_inventario_minimo_stock_positivo")` a `__table_args__` y la relationship `medida_venta` con `foreign_keys=[medida_venta_id]`
- [x] 1.3 En `app/models/inventario.py`, desambiguar la relationship `medida` existente agregando `foreign_keys=[medida_id]`
- [x] 1.4 En `app/models/medida.py`, agregar la relationship `inventarios_venta` con `foreign_keys="Inventario.medida_venta_id"` y desambiguar `inventarios` con `foreign_keys="Inventario.medida_id"`

## 2. Migración Alembic

- [x] 2.1 Crear migración `alembic/versions/<rev>_agregar_minimo_stock_y_medida_venta_a_inventario.py` que agregue `minimo_stock` (Integer, NOT NULL, `server_default="0"` y luego `server_default=None`) y `medida_venta_id` (UUID nullable)
- [x] 2.2 En la misma migración, crear la FK `medida_venta_id -> medida.id`, el índice `ix_inventario_medida_venta_id` y el CHECK `ck_inventario_minimo_stock_positivo`; `downgrade()` revierte todo

## 3. Schemas Pydantic

- [x] 3.1 En `app/schemas/inventario.py`, agregar a `InventarioCreate` `minimo_stock: int = Field(default=0, ge=0)` y `medida_venta_id: uuid.UUID | None = None`
- [x] 3.2 En `app/schemas/inventario.py`, agregar a `InventarioUpdate` `minimo_stock: int | None = Field(default=None, ge=0)` y `medida_venta_id: uuid.UUID | None = None`
- [x] 3.3 En `app/schemas/inventario.py`, agregar a `InventarioOut` `minimo_stock: int` y `medida_venta: MedidaOut | None = None`
- [x] 3.4 En `app/schemas/alta_inventario.py`, agregar a `InventarioAlta` `minimo_stock: int = Field(default=0, ge=0)` y `medida_venta_id: uuid.UUID | None = None`

## 4. Servicios

- [x] 4.1 En `app/services/inventario_service.py`, agregar validación de `medida_venta_id` (si no es None, debe existir y no estar eliminada; si no, `BadRequestError` 400)
- [x] 4.2 En `app/services/inventario_service.py`, setear `minimo_stock` y `medida_venta_id` en `create`
- [x] 4.3 En `app/services/inventario_service.py`, aplicar `minimo_stock` y `medida_venta_id` en `update` según `model_fields_set` (permite limpiar con null) y validar la medida de venta antes
- [x] 4.4 En `app/services/alta_inventario_service.py`, validar `medida_venta_id` (si viene) y setearlo junto con `minimo_stock` al construir el `Inventario` en `_alta_en_transaccion`

## 5. Repository

- [x] 5.1 En `app/repositories/inventario_repository.py`, agregar `selectinload(Inventario.medida_venta)` a `_relaciones_cargadas()`

## 6. Tests

- [x] 6.1 En `tests/test_inventario.py`, cubrir: create con `minimo_stock` default y explícito, create/update de `minimo_stock` negativo -> 422
- [x] 6.2 En `tests/test_inventario.py`, cubrir: create con `medida_venta_id` válido (respuesta con `medida_venta` anidado), sin `medida_venta_id` (null), `medida_venta_id` inexistente -> 400, y actualizar/limpiar `medida_venta_id`
- [x] 6.3 En `tests/test_alta_inventario.py`, cubrir: alta con `medida_venta_id` existente, sin `medida_venta_id` (null) y `medida_venta_id` inexistente -> 400 con rollback
- [x] 6.4 Ejecutar `python -m pytest tests -q` y corregir fallos

## 7. Verificación

- [x] 7.1 Correr `openspec validate inventario-stock-minimo-medida-venta --strict`
- [x] 7.2 Revisar que no queden referencias sin actualizar (grep `minimo_stock`/`medida_venta` en `app/` y `tests/`)
