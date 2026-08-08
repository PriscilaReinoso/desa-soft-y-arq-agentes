## 1. Preparación de la transacción

- [x] 1.1 Refactorizar los repositorios base (articulo, medida, espacio, inventario) para exponer inserciones sin commit (`flush`) que permitan componer la transacción
- [x] 1.2 Crear los esquemas compuestos `ArticuloAlta`, `MedidaAlta`, `EspacioAlta` e `InventarioAlta` en `app/schemas/`

## 2. Servicio de alta compuesta

- [x] 2.1 Crear `app/services/alta_inventario_service.py`: coordina el alta de artículo, medida y espacio (nuevos o existentes) y el alta del inventario en una única sesión
- [x] 2.2 Implementar la atomicidad: `commit()` solo al final y `rollback()` total ante cualquier fallo
- [x] 2.3 Aplicar las reglas del inventario: unicidad artículo + medida (409), stock/precio >= 0, espacio nulo solo si stock == 0

## 3. Router

- [x] 3.1 Crear/exponer el endpoint `POST /inventario/alta` en `app/api/v1/` (o ampliar `inventario.py`)
- [x] 3.2 Registrar el router en `app/main.py`

## 4. Pruebas

- [x] 4.1 Escribir pruebas pytest del alta compuesta exitosa (componentes nuevos y existentes, sin stock y sin espacio)
- [x] 4.2 Escribir pruebas pytest de rollback (fallo en alta de artículo, medida o espacio; combinación duplicada; precio negativo)
- [x] 4.3 Ejecutar `pytest` y corregir fallos
