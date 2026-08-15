## Why

Identificar rápidamente los ítems de inventario cuyo stock cayó por debajo del
mínimo configurado (`stock < minimo_stock`) permite anticipar reposiciones. Es
la base para las sugerencias de compra que expondrá el asistente inteligente.

## What Changes

- Nuevo endpoint `GET /api/v1/inventarios/bajo-minimo` que devuelve los ítems
  de inventario no eliminados con `stock < minimo_stock`.
- Respuesta paginada con el mismo shape del listado: los campos propios del
  ítem (`id`, `fila`, `columna`, `stock`, `minimo_stock`, `precio_venta`) y los
  objetos relacionados completos (`articulo` con su `categoria`, `medida`,
  `medida_venta` —puede ser `null`— y `espacio` con su `deposito`).
- Accesible a usuarios autenticados (ADMIN y CONSULTOR).

## Capabilities

### New Capabilities
<!-- Ninguna -->

### Modified Capabilities
- `inventarios-crud`: nuevo requerimiento para listar los ítems de inventario
  con stock por debajo del mínimo.

## Impact

- `app/api/v1/inventario.py`: nueva ruta `GET /bajo-minimo`.
- `app/services/inventario_service.py`: método `list_bajo_minimo`.
- `app/repositories/inventario_repository.py`: consulta filtrada por
  `stock < minimo_stock` con las relaciones cargadas.
- `tests/test_inventario.py`: tests del nuevo endpoint.
- No requiere migraciones ni cambios de esquema.
