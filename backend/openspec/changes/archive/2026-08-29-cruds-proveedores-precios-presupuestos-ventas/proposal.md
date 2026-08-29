## Why

El sistema ya gestiona artículos, medidas, depósitos, espacios e inventario.
Faltan los casos de uso de venta y abastecimiento definidos en
`docs/cu_spec.md` (línea 49 en adelante): proveedores, listas de precios,
presupuestos, métodos de pago y ventas. Sin estas capacidades no es posible
registrar qué se vende, de qué proveedor se compra y a qué precio.

## What Changes

- **CRUD Proveedores**: alta, lectura, actualización y baja lógica. El
  teléfono y el par nombre + apellido funcionan como identificadores de
  existencia. Un proveedor se asocia a 1 o más categorías (tabla
  `proveedor_categoria`).
- **CRUD Listas de Precios**: alta, lectura (con filtros y paginación),
  actualización y baja lógica por registro. Alta por JSON (uno o varios
  objetos) o por Excel (con un JSON de mapeo de columnas). Los artículos
  pueden existir o no: si no existen se dan de alta; si existen se reutilizan.
  Soporta `id_articulo_proveedor` como id propio del proveedor. Reglas de
  rollback ante cualquier error de alta.
- **CRUD Presupuestos**: alta, lectura, actualización y baja lógica. Alta de
  cabecera + uno o varios detalles replicando información del inventario, con
  `numero` autoincremental. Cálculo de `sub_total` por detalle, y `cantidad` y
  `total` en la cabecera. Generación de PDF a partir de número o id.
- **CRUD Métodos de Pago**: alta, lectura, actualización y baja lógica.
- **CRUD Ventas**: alta, lectura, actualización y baja lógica. Alta de
  cabecera + uno o varios detalles replicando información del inventario y
  descontando stock según cantidad vendida. Por defecto `aprobado=false`.
- Migraciones Alembic para las nuevas tablas y pruebas pytest.

## Capabilities

### New Capabilities
- `proveedores-crud`: CRUD de proveedores con identificación por teléfono o
  nombre + apellido y asociación a categorías.
- `listas-precios`: CRUD de listas de precios con alta por JSON o Excel,
  filtros de lectura (categoría, artículo, proveedor) y alta de artículos
  nuevos o reutilización de existentes.
- `presupuestos`: CRUD de presupuestos con cabecera + detalles, número
  autoincremental, cálculo de cantidades/subtotales/total y exportación a PDF.
- `metodos-pago-crud`: CRUD de métodos de pago.
- `ventas`: CRUD de ventas con cabecera + detalles, descuento de stock del
  inventario y estado de aprobación por defecto.

### Modified Capabilities

## Impact

- Código: nuevos modelos (`Proveedor`, `ProveedorCategoria`, `ListaPrecios`,
  `PresupuestoCabecera`, `PresupuestoDetalle`, `MetodoPago`, `VentaCabecera`,
  `VentaDetalle`), schemas, repositories, services y routers; registro en
  `app/main.py`.
- Base de datos: nuevas tablas `proveedor`, `proveedor_categoria`,
  `lista_precios`, `presupuesto_cabecera`, `presupuesto_detalle`,
  `metodo_pago`, `venta_cabecera` y `venta_detalle` (migración Alembic).
- Dependencias: manejo de archivos Excel (p.ej. `openpyxl`) y generación de
  PDF.
- Seguridad: los endpoints requieren JWT; alta y modificación restringidas a
  `ADMIN`.
- Pruebas: nuevas suites pytest para cada CRUD.
