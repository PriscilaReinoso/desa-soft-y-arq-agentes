# Ventas Specification

## Purpose

Permite administrar las ventas a partir del inventario: alta con cabecera y
detalles, lectura, actualización y baja lógica. El stock del inventario solo
se descuenta cuando la venta está aprobada.

## Requirements

### Requirement: Crear venta

El sistema SHALL permitir crear una venta recibiendo un array de ítems
referenciados por `inventario_id` con su `cantidad`. Se crea una
`venta_cabecera` y uno o muchos `venta_detalle` que replican la información del
inventario (artículo, medida y `precio_venta`). En cada detalle se calcula
`sub_total = cantidad * precio_venta`. En la cabecera se calcula `cantidad`
como la suma de las cantidades del detalle y `total` como la suma de los
`sub_total` del detalle. El número de la venta es autoincremental iniciando en
1. Por defecto la venta se crea con `aprobado=false`, salvo que se envíe
`aprobado: true`.

El stock del inventario se valida siempre pero solo se descuenta si la venta se
crea con `aprobado=true`. Si la `cantidad` supera el stock, se rechaza con HTTP
422 independientemente del valor de `aprobado`.

#### Scenario: Creación sin aprobación no descuenta stock
- **WHEN** se envía un array de `inventario_id` con sus `cantidad` válidos y stock suficiente, sin enviar `aprobado` o con `aprobado=false`
- **THEN** el sistema crea la venta con `aprobado=false`, valida stock pero no lo descuenta, y responde HTTP 201

#### Scenario: Creación aprobada descuenta stock
- **WHEN** se envía `aprobado: true` con stock suficiente
- **THEN** el sistema crea la venta con `aprobado=true`, descuenta el stock del inventario y responde HTTP 201

#### Scenario: Número autoincremental
- **WHEN** se crea una venta y ya existen otras
- **THEN** el sistema asigna el número consecutivo siguiente al último creado

#### Scenario: Ítem de inventario inexistente
- **WHEN** se envía un `inventario_id` que no existe o está eliminado
- **THEN** el sistema rechaza la creación con HTTP 400

#### Scenario: Cantidad no positiva
- **WHEN** se envía una `cantidad` menor o igual a 0 en alguno de los ítems
- **THEN** el sistema rechaza la creación con HTTP 422

#### Scenario: Stock insuficiente
- **WHEN** la `cantidad` vendida supera el stock disponible del inventario
- **THEN** el sistema rechaza la creación con HTTP 422

#### Scenario: Creación con detalles vacíos
- **WHEN** se envía un array de ítems vacío
- **THEN** el sistema rechaza la creación con HTTP 422

### Requirement: Obtener venta

El sistema SHALL exponer un endpoint que devuelva una venta por su `id` o por
su `numero`. La respuesta incluye la cabecera completa y todos sus
`venta_detalle` en un array. Si no existe o fue eliminada, responde HTTP 404.

#### Scenario: Consulta por id
- **WHEN** se consulta una venta por un `id` válido y no eliminado
- **THEN** el sistema responde HTTP 200 con la cabecera y el array de detalles

#### Scenario: Consulta por número
- **WHEN** se consulta una venta por su `numero`
- **THEN** el sistema responde HTTP 200 con la cabecera y el array de detalles

#### Scenario: Venta inexistente
- **WHEN** se consulta una venta que no existe o está eliminada
- **THEN** el sistema responde HTTP 404

### Requirement: Listar ventas

El sistema SHALL exponer un endpoint que devuelva el listado de ventas no
eliminadas, con paginación, incluyendo cabecera y detalles.

#### Scenario: Listado exitoso
- **WHEN** se solicita el listado de ventas
- **THEN** el sistema responde HTTP 200 con una lista paginada de ventas no eliminadas con sus detalles

#### Scenario: Listado excluye ventas eliminadas
- **WHEN** se solicita el listado y existe una venta con `deleted_at` no nulo
- **THEN** la venta eliminada no aparece en la respuesta

### Requirement: Actualizar venta

El sistema SHALL permitir actualizar los datos editables de una venta, incluido
`aprobado`. El stock se ajusta según el estado de aprobación:

- Si la venta estaba aprobada y se cambian ítems, primero se restaura el stock
  viejo, se validan los nuevos ítems y luego se descuenta el stock nuevo.
- Si se aprueba una venta (de `false` a `true`), se valida y descuenta stock
  para sus ítems actuales. Si el stock no es suficiente, se rechaza con HTTP 400.
- Si se desaprueba una venta (de `true` a `false`), se restaura el stock. Solo
  se permite si la venta fue creada hace 7 días o menos; fuera de ese plazo se
  responde HTTP 400.

#### Scenario: Aprobar venta descuenta stock
- **WHEN** se envía `aprobado: true` para una venta no aprobada
- **THEN** el sistema valida stock suficiente, descuenta el stock del inventario y responde HTTP 200

#### Scenario: Aprobar sin stock suficiente
- **WHEN** se envía `aprobado: true` pero el stock disponible es menor que la cantidad de los ítems
- **THEN** el sistema rechaza la operación con HTTP 400

#### Scenario: Desaprobar venta restaura stock
- **WHEN** se envía `aprobado: false` para una venta aprobada creada hace 7 días o menos
- **THEN** el sistema restaura el stock del inventario y responde HTTP 200

#### Scenario: Desaprobar venta fuera de plazo
- **WHEN** se envía `aprobado: false` para una venta aprobada creada hace más de 7 días
- **THEN** el sistema rechaza la operación con HTTP 400

#### Scenario: Actualizar ítems de venta aprobada
- **WHEN** se cambian los ítems de una venta aprobada
- **THEN** el sistema restaura el stock viejo, valida y reemplaza los ítems, y descuenta el stock nuevo

#### Scenario: Actualizar ítems de venta no aprobada
- **WHEN** se cambian los ítems de una venta no aprobada
- **THEN** el sistema valida los nuevos ítems, reemplaza los detalles y recalcula totales sin tocar el stock

#### Scenario: Actualización de venta inexistente
- **WHEN** se intenta actualizar una venta que no existe o está eliminada
- **THEN** el sistema responde HTTP 404

#### Scenario: Stock insuficiente al actualizar
- **WHEN** se incrementa la `cantidad` de un ítem y el stock disponible no alcanza
- **THEN** el sistema rechaza la actualización con HTTP 422

### Requirement: Eliminar venta (baja lógica)

El sistema SHALL permitir eliminar lógicamente una venta seteando `deleted_at`;
no elimina físicamente el registro. Solo se permite eliminar si la venta fue
creada hace 7 días o menos. Si la venta estaba aprobada, se restaura el stock
del inventario antes de eliminar. Si no existe, responde HTTP 404.

#### Scenario: Baja lógica de venta existente dentro del plazo
- **WHEN** se solicita eliminar una venta creada hace 7 días o menos
- **THEN** el sistema setea `deleted_at` y responde HTTP 204

#### Scenario: Eliminar venta aprobada restaura stock
- **WHEN** se elimina una venta aprobada dentro del plazo
- **THEN** el sistema restaura el stock del inventario y responde HTTP 204

#### Scenario: Eliminar venta fuera de plazo
- **WHEN** se solicita eliminar una venta creada hace más de 7 días
- **THEN** el sistema rechaza la operación con HTTP 400

#### Scenario: Baja de venta inexistente
- **WHEN** se solicita eliminar una venta que no existe
- **THEN** el sistema responde HTTP 404