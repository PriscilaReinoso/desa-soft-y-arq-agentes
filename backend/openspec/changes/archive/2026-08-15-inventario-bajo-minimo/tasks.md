## 1. Repository

- [x] 1.1 En `app/repositories/inventario_repository.py`, agregar método `list_bajo_minimo(skip=0, limit=100)` que consulte los ítems no eliminados con `stock < minimo_stock`, con `_relaciones_cargadas()` y ordenados por `articulo_id`
- [x] 1.2 Reutilizar `_relaciones_cargadas()` para que el shape coincida con el listado

## 2. Service

- [x] 2.1 En `app/services/inventario_service.py`, agregar método `list_bajo_minimo(skip=0, limit=100)` que delegue en el repository
- [x] 2.2 Sin reglas de negocio adicionales (consulta directa, misma validación de autenticación que el listado)

## 3. Router

- [x] 3.1 En `app/api/v1/inventario.py`, agregar `GET /inventarios/bajo-minimo` con `response_model=list[InventarioOut]` y paginación (`skip`, `limit`)
- [x] 3.2 Declarar la ruta antes de `GET /{inventario_id}` para evitar el conflicto de conversión a `uuid.UUID`
- [x] 3.3 Dejar el endpoint accesible a cualquier usuario autenticado (sin `require_roles`), igual que el listado

## 4. Tests

- [x] 4.1 En `tests/test_inventario.py`, cubrir: lista los ítems con `stock < minimo_stock` con sus objetos relacionados
- [x] 4.2 Cubrir: excluye ítems con `stock >= minimo_stock`
- [x] 4.3 Cubrir: excluye ítems con `minimo_stock == 0`
- [x] 4.4 Cubrir: excluye ítems eliminados (baja lógica)
- [x] 4.5 Cubrir: lista vacía cuando no hay ítems bajo el mínimo
- [x] 4.6 Cubrir: paginación del nuevo endpoint
- [x] 4.7 Ejecutar `python -m pytest tests -q` y corregir fallos

## 5. Verificación

- [x] 5.1 Correr `openspec validate inventario-bajo-minimo --strict`
- [x] 5.2 Revisar que no queden referencias sin actualizar (grep `bajo_minimo` en `app/` y `tests/`)
