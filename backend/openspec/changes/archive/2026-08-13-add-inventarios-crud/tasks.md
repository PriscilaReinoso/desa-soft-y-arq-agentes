## 1. Modelos

- [x] 1.1 Crear `app/models/inventario.py` (tabla `inventario`: id UUID, articulo_id FK, medida_id FK, espacio_id FK nullable, fila, columna, stock default 0, precio_venta NUMERIC(12,2), UNIQUE(articulo_id, medida_id), CHECK(stock >= 0), CHECK(precio_venta >= 0), timestamps, `deleted_at`)
- [x] 1.2 Declarar las relaciones bidireccionales `Inventario.articulo`, `Inventario.medida`, `Inventario.espacio` y las colecciones inversas en los modelos padre

## 2. Schemas

- [x] 2.1 Crear `app/schemas/inventario.py` con esquemas de creación, actualización, respuesta y listado

## 3. Repositorios

- [x] 3.1 Crear `app/repositories/inventario_repository.py`: CRUD + consulta por combinación (articulo_id, medida_id) + filtrando `deleted_at`

## 4. Services

- [x] 4.1 Crear `app/services/inventario_service.py`: reglas de negocio (validación de referencias, unicidad artículo + medida, stock/precio >= 0, fila/columna >= 0, espacio obligatorio si stock > 0)

## 5. Routers

- [x] 5.1 Crear `app/api/v1/inventario.py`: endpoints GET list, POST, GET by id, PUT, DELETE
- [x] 5.2 Registrar el router en `app/main.py`

## 6. Migraciones y Pruebas

- [x] 6.1 Generar y aplicar la migración Alembic para `inventario`
- [x] 6.2 Escribir pruebas pytest del CRUD de inventario (reglas de stock, precio, ubicación, unicidad, baja lógica)
- [x] 6.3 Ejecutar `pytest` y corregir fallos

## 7. Respuesta con objetos relacionados

- [x] 7.1 Extender `InventarioOut` en `app/schemas/inventario.py` con los objetos anidados `articulo` (incluye `categoria`), `medida` y `espacio` (incluye `deposito`)
- [x] 7.2 Agregar eager loading de `articulo.categoria`, `medida` y `espacio.deposito` en `list` y `get` del repository
- [x] 7.3 Actualizar las pruebas para verificar que el response incluye los objetos relacionados completos
- [x] 7.4 Ejecutar `pytest` y corregir fallos
