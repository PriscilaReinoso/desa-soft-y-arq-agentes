## 1. Modelos

- [x] 1.1 Crear `app/models/proveedor.py` (tabla `proveedor`: id UUID, nombre, apellido, telefono, direccion, timestamps, `deleted_at`)
- [x] 1.2 Crear `app/models/proveedor_categoria.py` (tabla `proveedor_categoria`: id UUID, proveedor_id FK, categoria_id FK)
- [x] 1.3 Crear `app/models/lista_precios.py` (tabla `lista_precios`: id UUID, articulo_id FK, medida_id FK, proveedor_id FK, id_articulo_proveedor, precio_lista NUMERIC(12,2), UNIQUE(proveedor_id, articulo_id), CHECK(precio_lista >= 0), timestamps, `deleted_at`)
- [x] 1.4 Crear `app/models/presupuesto.py` (tablas `presupuesto_cabecera` y `presupuesto_detalle`: cabecera con fecha, numero autoincremental calculado en Service, cantidad, total, cliente, aprobado default false, dias_valido; detalle con presupuesto_id FK, articulo_id FK, medida_id FK, cantidad, precio_venta, sub_total)
- [x] 1.5 Crear `app/models/metodo_pago.py` (tabla `metodo_pago`: id UUID, nombre UNIQUE NOT NULL, descripcion, timestamps, `deleted_at`)
- [x] 1.6 Crear `app/models/venta.py` (tablas `venta_cabecera` y `venta_detalle`: cabecera con fecha, numero autoincremental calculado en Service, presupuesto_id FK nullable, cantidad, total, cliente, aprobado default false; detalle con articulo_id FK, medida_id FK, cantidad, precio_venta, sub_total, metodo_pago_id FK)
- [x] 1.7 Declarar relaciones bidireccionales: colecciones inversas en `Articulo` (listas_precios), `Medida` (listas_precios), `Categoria` (proveedor_assoc), `Proveedor` (listas_precios, categoria_assoc + property categorias), `MetodoPago` (ventas) y cabecera↔detalle en presupuestos y ventas

## 2. Migraciones

- [x] 2.1 Crear la migración Alembic `20260816_0001` con las 8 tablas nuevas (las secuencias se reemplazan por `numero` calculado en Service, ver design.md #4)
- [x] 2.2 Agregar dependencias `openpyxl` y `reportlab` a los archivos de dependencias del proyecto

## 3. Schemas

- [x] 3.1 Crear `app/schemas/proveedor.py` (Create, Update, Out con categorias)
- [x] 3.2 Crear `app/schemas/lista_precios.py` (Create JSON con proveedor header + array de items con articulo/medida/precio_lista, Update, Out, mapeo Excel)
- [x] 3.3 Crear `app/schemas/presupuesto.py` (Create con array de inventario_id + cantidad, Update, Out con cabecera + detalle array)
- [x] 3.4 Crear `app/schemas/metodo_pago.py` (Create, Update, Out)
- [x] 3.5 Crear `app/schemas/venta.py` (Create con array de inventario_id + cantidad + aprobado, Update, Out con cabecera + detalle array)

## 4. Repositories

- [x] 4.1 Crear `app/repositories/proveedor_repository.py`: CRUD + consulta por telefono y por (nombre, apellido) filtrando `deleted_at`
- [x] 4.2 Crear `app/repositories/proveedor_categoria_repository.py`: alta/consulta de asociaciones proveedor-categoria
- [x] 4.3 Crear `app/repositories/lista_precios_repository.py`: CRUD + filtros por categorias/articulos/proveedor + consulta por (proveedor, articulo) e id_articulo_proveedor
- [x] 4.4 Crear `app/repositories/presupuesto_repository.py`: CRUD + consulta por id/numero + listado con detalles
- [x] 4.5 Crear `app/repositories/metodo_pago_repository.py`: CRUD + consulta por nombre
- [x] 4.6 Crear `app/repositories/venta_repository.py`: CRUD + consulta por id/numero + listado con detalles

## 5. Services

- [x] 5.1 Crear `app/services/proveedor_service.py`: reglas de unicidad (telefono y nombre+apellido) y asociación a categorias
- [x] 5.2 Crear `app/services/lista_precios_service.py`: alta compuesta JSON (proveedor + articulos/medidas + registros) con rollback; alta por Excel con mapeo de columnas y reporte de linea/columna; actualizacion de precio_lista; listado con filtros
- [x] 5.3 Crear `app/services/presupuesto_service.py`: alta desde array de inventario_id, calculo de sub_total/cantidad/total, numero autoincremental, generacion de PDF con reportlab
- [x] 5.4 Crear `app/services/metodo_pago_service.py`: reglas de unicidad de nombre
- [x] 5.5 Crear `app/services/venta_service.py`: alta desde array de inventario_id con descuento de stock, validacion de stock disponible, calculo de sub_total/cantidad/total, numero autoincremental, ajuste de stock en actualizacion

## 6. Routers

- [x] 6.1 Crear `app/api/v1/proveedores.py`: endpoints GET list, POST, GET by id, PUT, DELETE
- [x] 6.2 Crear `app/api/v1/listas_precios.py`: endpoints GET list con filtros, POST JSON, POST excel, GET by id, PUT, DELETE
- [x] 6.3 Crear `app/api/v1/presupuestos.py`: endpoints GET list, POST, GET by id/numero, PUT, DELETE, GET pdf (por numero o id)
- [x] 6.4 Crear `app/api/v1/metodos_pago.py`: endpoints GET list, POST, GET by id, PUT, DELETE
- [x] 6.5 Crear `app/api/v1/ventas.py`: endpoints GET list, POST, GET by id/numero, PUT, DELETE
- [x] 6.6 Registrar los 5 routers en `app/main.py`

## 7. Pruebas

- [x] 7.1 Escribir pruebas pytest del CRUD de proveedores (unicidad, categorias, baja logica)
- [x] 7.2 Escribir pruebas pytest de listas de precios (alta JSON, alta Excel, rollback, filtros, baja logica)
- [x] 7.3 Escribir pruebas pytest de presupuestos (calculos, numero autoincremental, PDF, baja logica)
- [x] 7.4 Escribir pruebas pytest de metodos de pago (unicidad, baja logica)
- [x] 7.5 Escribir pruebas pytest de ventas (descuento de stock, stock insuficiente, aprobado por defecto, calculos, baja logica)
- [x] 7.6 Ejecutar `pytest` completo y corregir fallos

## 8. Refinamientos (iteración posterior a prueba manual)

- [x] 8.1 En `_leer_excel` (`lista_precios_service.py`): normalizar encabezados del Excel con `strip()` al armar el índice de columnas y al resolver cada `mapeo.value`, para que coincidan con los encabezados recortados que envía el frontend (evita "falta el nombre o id del artículo" cuando el encabezado tiene espacios); test de regresión con encabezados con espacios en `tests/test_lista_precios.py`
