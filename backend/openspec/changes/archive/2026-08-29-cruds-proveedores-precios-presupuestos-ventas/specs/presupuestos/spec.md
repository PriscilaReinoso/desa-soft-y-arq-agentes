## Purpose

Permite administrar presupuestos de venta a partir del inventario: alta con
cabecera y detalles, lectura, actualización, baja lógica y exportación a PDF.

## ADDED Requirements

### Requirement: Crear presupuesto

El sistema SHALL permitir crear un presupuesto recibiendo un array de ítems
referenciados por `inventario_id` con su `cantidad`. Se crea una
`presupuesto_cabecera` y uno o muchos `presupuesto_detalle` que replican la
información del inventario (artículo, medida y `precio_venta`). El número del
presupuesto es autoincremental iniciando en 1. En cada detalle se calcula
`sub_total = cantidad * precio_venta`. En la cabecera se calcula `cantidad`
como la suma de las cantidades del detalle y `total` como la suma de los
`sub_total` del detalle.

#### Scenario: Creación exitosa
- **WHEN** se envía un array de `inventario_id` con sus `cantidad` válidos
- **THEN** el sistema crea la cabecera con su número y los detalles, calcula `sub_total`, `cantidad` y `total`, y responde HTTP 201

#### Scenario: Número autoincremental
- **WHEN** se crea un presupuesto y ya existen otros
- **THEN** el sistema asigna el número consecutivo siguiente al último creado

#### Scenario: Ítem de inventario inexistente
- **WHEN** se envía un `inventario_id` que no existe o está eliminado
- **THEN** el sistema rechaza la creación con HTTP 400

#### Scenario: Cantidad no positiva
- **WHEN** se envía una `cantidad` menor o igual a 0 en alguno de los ítems
- **THEN** el sistema rechaza la creación con HTTP 422

#### Scenario: Creación con detalles vacíos
- **WHEN** se envía un array de ítems vacío
- **THEN** el sistema rechaza la creación con HTTP 422

### Requirement: Obtener presupuesto

El sistema SHALL exponer un endpoint que devuelva un presupuesto por su `id` o
por su `numero`. La respuesta incluye la cabecera completa y todos sus
`presupuesto_detalle` en un array. Si no existe o fue eliminado, responde HTTP
404.

#### Scenario: Consulta por id
- **WHEN** se consulta un presupuesto por un `id` válido y no eliminado
- **THEN** el sistema responde HTTP 200 con la cabecera y el array de detalles

#### Scenario: Consulta por número
- **WHEN** se consulta un presupuesto por su `numero`
- **THEN** el sistema responde HTTP 200 con la cabecera y el array de detalles

#### Scenario: Presupuesto inexistente
- **WHEN** se consulta un presupuesto que no existe o está eliminado
- **THEN** el sistema responde HTTP 404

### Requirement: Listar presupuestos

El sistema SHALL exponer un endpoint que devuelva el listado de presupuestos no
eliminados, con paginación, incluyendo cabecera y detalles.

#### Scenario: Listado exitoso
- **WHEN** se solicita el listado de presupuestos
- **THEN** el sistema responde HTTP 200 con una lista paginada de presupuestos no eliminados con sus detalles

#### Scenario: Listado excluye presupuestos eliminados
- **WHEN** se solicita el listado y existe un presupuesto con `deleted_at` no nulo
- **THEN** el presupuesto eliminado no aparece en la respuesta

### Requirement: Actualizar presupuesto

El sistema SHALL permitir actualizar los datos editables de un presupuesto. Si
se actualizan los ítems, se recalculan `sub_total`, `cantidad` y `total` según
las mismas reglas de la creación.

#### Scenario: Actualización exitosa
- **WHEN** se actualizan datos de un presupuesto existente
- **THEN** el sistema actualiza el presupuesto (recalculando totales si cambian los ítems) y responde HTTP 200

#### Scenario: Actualización de presupuesto inexistente
- **WHEN** se intenta actualizar un presupuesto que no existe o está eliminado
- **THEN** el sistema responde HTTP 404

### Requirement: Eliminar presupuesto (baja lógica)

El sistema SHALL permitir eliminar lógicamente un presupuesto seteando
`deleted_at`; no elimina físicamente el registro. Si no existe, responde HTTP
404.

#### Scenario: Baja lógica de presupuesto existente
- **WHEN** se solicita eliminar un presupuesto existente
- **THEN** el sistema setea `deleted_at` y responde HTTP 204

#### Scenario: Baja de presupuesto inexistente
- **WHEN** se solicita eliminar un presupuesto que no existe
- **THEN** el sistema responde HTTP 404

### Requirement: Generar PDF de presupuesto

El sistema SHALL exponer un endpoint que reciba un `numero` o `id` de
presupuesto y devuelva el PDF del mismo.

#### Scenario: PDF generado correctamente
- **WHEN** se solicita el PDF de un presupuesto existente por número o id
- **THEN** el sistema responde HTTP 200 con el archivo PDF del presupuesto

#### Scenario: PDF de presupuesto inexistente
- **WHEN** se solicita el PDF de un presupuesto que no existe o está eliminado
- **THEN** el sistema responde HTTP 404
