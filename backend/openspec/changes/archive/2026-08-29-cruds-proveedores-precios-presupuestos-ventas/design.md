## Context

La arquitectura por capas del backend está asentada (Router → Service →
Repository → SQLAlchemy), con convenciones claras: UUID como PK, timestamps
(`created_at`, `updated_at`, `deleted_at`), soft delete, modelos en singular y
relaciones bidireccionales. Los modelos `Articulo`, `Medida`, `Inventario`,
`Categoria` y `Proveedor` de `docs/db_schema.md` ya existen. Este change agrega
las entidades de venta y abastecimiento definidas en `docs/cu_spec.md` (línea
49 en adelante) y en `docs/db_schema.md`.

## Goals / Non-Goals

**Goals:**
- Modelos, migraciones, schemas, repos, services y routers para proveedores,
  listas de precios, presupuestos, métodos de pago y ventas.
- Alta de listas de precios por JSON y por Excel con rollback transaccional.
- Cálculo de subtotales/totales y exportación de presupuestos a PDF.
- Descuento de stock al crear/actualizar ventas, validando stock disponible.
- Números autoincrementales para presupuestos y ventas iniciando en 1.

**Non-Goals:**
- CRUD de artículos, medidas, categorías o inventario (changes archivados).
- Módulos de facturación electrónica, recibo, caja o contabilidad.
- Convertir presupuesto en venta automáticamente (solo se guarda
  `presupuesto_id` en `venta_detalle` si se provee).

## Decisions

### 1. Nombres y shape de modelos
Modelos en singular según `docs/db_schema.md`: `Proveedor`, `ProveedorCategoria`
(tabla puente con `id` UUID PK), `ListaPrecios`, `PresupuestoCabecera`,
`PresupuestoDetalle`, `MetodoPago`, `VentaCabecera` y `VentaDetalle`. Todas con
timestamps y `deleted_at`. Se agregan las colecciones inversas esperadas en los
modelos padre ya existentes: `Articulo.listas_precios`,
`Medida.listas_precios`, `Proveedor.listas_precios`,
`Proveedor.categorias` (via `ProveedorCategoria`), `MetodoPago.ventas`.

### 2. Unicidad de proveedor en el Service
El `telefono` y el par `(nombre, apellido)` funcionan como identificadores de
existencia. No se materializan como `UNIQUE` a nivel de base porque el soft
delete haría que un proveedor borrado bloquee el re-alta; la validación vive en
`ProveedorService` (query contra registros no eliminados) y rechaza con HTTP
409. Alternativa descartada: `UNIQUE` + índice parcial, que complica el modelo
sin beneficio real en este proyecto.

### 3. Alta de listas de precios transaccional (JSON y Excel)
El alta compone proveedor + artículos + medidas + registros de lista de
precios en una sola transacción. El Service orquesta con repositories y hace
commit al final; ante cualquier excepción se revierte todo (`rollback`). Reglas
compartidas: si el artículo viene con `id` se reutiliza (validando existencia),
si viene sin `id` se crea (con su `medida`); `id_articulo_proveedor` se
almacena tal cual y nunca se usa como id del artículo. Para Excel se usa
`openpyxl` (lectura), el JSON de mapeo traduce columnas del archivo a campos de
base, y el error reporta línea y columna del conflicto antes del rollback.

### 4. Números autoincrementales calculados en el Service
`presupuesto_cabecera.numero` y `venta_cabecera.numero` se generan en el
Service como `max(numero) + 1` sobre todos los registros (incluidos los de baja
lógica, que ya consumieron su número). Alternativa descartada: `Sequence` de
SQLAlchemy/PostgreSQL, que no funciona en la base SQLite usada por los tests
(`unknown function: nextval`). Trade-off aceptado: bajo concurrencia puede
haber colisión; para este dominio de baja escritura es aceptable.

### 5. Cálculos y desguace de stock en el Service
`sub_total = cantidad * precio_venta` (por detalle), `cantidad = sum(cantidad)` y
`total = sum(sub_total)` (en cabecera) se calculan en el Service antes de
persistir, replicando `precio_venta` del inventario. Al crear/actualizar una
venta se valida `cantidad <= stock` del inventario y se descuenta/ajusta el
stock dentro de la misma transacción (HTTP 422 si no alcanza).

### 6. PDF de presupuesto con ReportLab
Se agrega `reportlab` para generar el PDF del presupuesto (cabecera + detalle).
Se elige sobre `weasyprint` (más pesado, requiere sistema de render web) y
`fpdf2` (menos control de tablas). El endpoint recibe `numero` o `id` y devuelve
`Response` con `application/pdf`.

### 7. Schemas Pydantic por operación
`*Create`, `*Update`, `*Out` y `*ListItem` siguiendo `app/schemas/inventario.py`
(`ConfigDict(from_attributes=True)`). Respuestas con objetos anidados completos
y eager loading con `selectinload` para evitar consultas N+1.

### 8. Reactivación de listas de precios soft-deleted y update validado
`lista_precios` tiene `UNIQUE (id_proveedor, articulo_id)`. Si al dar de alta ya
existe un registro **eliminado** con la misma combinación, se reactiva
(se limpia `deleted_at`) y se actualiza su `precio_lista`/`id_articulo_proveedor`
en lugar de insertar (evita violar el UNIQUE). Si existe un registro **activo**,
se rechaza con HTTP 409. El update se resuelve por path UUID y el campo opcional
`id_articulo_proveedor` del body actúa como filtro validador: si se envía y no
coincide con el registro, se responde 404.

### 9. Reemplazo de ítems en presupuesto/venta sin UNIQUE en detalle
`presupuesto_detalle` **no** tiene `UNIQUE (presupuesto_id, articulo_id,
medida_id)`: el update reemplaza la colección de detalles y SQLAlchemy emite
DELETE de los viejos e INSERT de los nuevos en el mismo flush; un UNIQUE
provocaría `IntegrityError` por orden de ejecución. La relación usa cascade
`all, delete-orphan`, por lo que las líneas de detalle reemplazadas se borran
físicamente (el soft delete aplica a las cabeceras). En ventas, antes de
reemplazar se restaura el stock de los detalles viejos (buscando el inventario
por combinación `articulo_id + medida_id`) y se descuenta el de los nuevos en la
misma transacción con rollback ante cualquier error.

## Risks / Trade-offs

- **Alta compuesta por JSON/Excel compleja** → riesgo de estados parciales.
  Mitigación: transacción única + rollback; tests de casos de fallo.
- **Secuencias de base para `numero`** → saltos de numeración tras rollback.
  Aceptable: `numero` es autoincremental, no exige continuidad sin huecos.
- **Stock descontado en transacción** → riesgo de carrera entre ventas
  concurrentes. Mitigación: validación de stock dentro de la misma
  transacción (asiento `FOR UPDATE` en el repository si se requiere).
- **Dependencias nuevas (`openpyxl`, `reportlab`)** → crecimiento del
  paquete. Mitigación: se declaran en `requirements.txt`/`pyproject.toml`.

## Migration Plan

1. Generar y aplicar la migración Alembic con las 8 tablas nuevas. Sin
   secuencias: el `numero` se calcula en el Service (`max + 1`, ver decisión 4).
2. Agregar las dependencias `openpyxl` y `reportlab`.
3. Implementar por capa en este orden: modelos → migraciones → schemas →
   repositories → services → routers → registro en `app/main.py`.
4. Escribir pruebas pytest por capacidad y ejecutar `pytest` completo.
5. Rollback: revertir la migración (`alembic downgrade -1`) y quitar
   dependencias si fuera necesario.

## Open Questions

- ¿La venta debe poder registrarse asociada a un método de pago y/o a un
  presupuesto? `docs/db_schema.md` contempla `venta_detalle.metodo_pago_id` y
  `venta_cabecera.presupuesto_id` (nullable), pero `docs/cu_spec.md` no lo
  detalla. Se implementarán como columnas opcionales del modelo sin cambios de
  spec.
