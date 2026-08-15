# Inventarios Crud Specification

## Purpose

Permite administrar el inventario a través de una API REST: listado, creación,
consulta, actualización y baja lógica. El inventario asocia un artículo con su
medida, stock, precio de venta y ubicación (espacio, fila y columna).

## Requirements

### Requirement: Listar inventario

El sistema SHALL exponer un endpoint que devuelva el listado de ítems de
inventario no eliminados, con paginación. Cada ítem incluye `id`, `fila`,
`columna`, `stock`, `minimo_stock`, `precio_venta` y los objetos relacionados
completos: `articulo` (con su `categoria`), `medida`, `espacio` (con su
`deposito`) y `medida_venta` (puede ser `null`). Los identificadores de los
relacionados solo aparecen dentro de su objeto (`articulo.id`, `medida.id`,
`espacio.id`, `medida_venta.id`).

#### Scenario: Listado exitoso de inventario
- **WHEN** se solicita el listado de inventario
- **THEN** el sistema responde HTTP 200 con una lista paginada de ítems no eliminados

#### Scenario: Listado excluye ítems eliminados
- **WHEN** se solicita el listado y existe un ítem con `deleted_at` no nulo
- **THEN** el ítem eliminado no aparece en la respuesta

#### Scenario: Listado incluye los objetos relacionados
- **WHEN** se solicita el listado y los ítems tienen artículo, medida, medida de venta y espacio asignados
- **THEN** cada ítem incluye el objeto `articulo` con su `categoria`, el objeto `medida`, el objeto `medida_venta` y el objeto `espacio` con su `deposito`

#### Scenario: Ítem sin espacio devuelve espacio nulo
- **WHEN** un ítem tiene `espacio_id` nulo
- **THEN** el campo `espacio` del ítem es `null`

#### Scenario: Ítem sin medida de venta devuelve medida_venta nulo
- **WHEN** un ítem tiene `medida_venta_id` nulo
- **THEN** el campo `medida_venta` del ítem es `null`

### Requirement: Crear ítem de inventario

El sistema SHALL permitir crear un ítem de inventario con `articulo_id`,
`medida_id` y, opcionalmente, `espacio_id`, `fila`, `columna`, `stock`,
`minimo_stock`, `precio_venta` y `medida_venta_id`. Reglas:

- `articulo_id` y `medida_id` deben referenciar entidades existentes y no
  eliminadas; `medida_venta_id`, si se envía, debe referenciar una medida
  existente y no eliminada.
- La combinación `articulo_id` + `medida_id` es única.
- `stock`, `minimo_stock` y `precio_venta` deben ser `>= 0`.
- `minimo_stock` tiene default 0.
- Si se envía `espacio_id`, `fila` y `columna` deben ser `>= 0`.
- `espacio_id` puede ser `null` solo si `stock == 0`.

#### Scenario: Creación exitosa con ubicación
- **WHEN** se envían `articulo_id`, `medida_id`, `espacio_id`, `fila`, `columna`, `stock` y `precio_venta` válidos
- **THEN** el sistema crea el ítem y responde HTTP 201 con el ítem creado

#### Scenario: Creación sin ubicación y sin stock
- **WHEN** se envían `articulo_id`, `medida_id`, `precio_venta` y no se envía `espacio_id`, `fila`, `columna` ni `stock`
- **THEN** el sistema crea el ítem con `espacio_id = null` y `stock = 0` y responde HTTP 201

#### Scenario: Combinación artículo y medida duplicada
- **WHEN** se envía una combinación `articulo_id` + `medida_id` que ya existe
- **THEN** el sistema rechaza la creación con HTTP 409

#### Scenario: Stock negativo
- **WHEN** se envía un `stock` menor que 0
- **THEN** el sistema rechaza la solicitud con HTTP 422

#### Scenario: Stock mínimo negativo
- **WHEN** se envía un `minimo_stock` menor que 0
- **THEN** el sistema rechaza la solicitud con HTTP 422

#### Scenario: Precio negativo
- **WHEN** se envía un `precio_venta` menor que 0
- **THEN** el sistema rechaza la solicitud con HTTP 422

#### Scenario: Fila o columna negativa
- **WHEN** se envía una `fila` o `columna` menor que 0
- **THEN** el sistema rechaza la solicitud con HTTP 422

#### Scenario: Stock positivo sin espacio asignado
- **WHEN** se envía un `stock` mayor que 0 sin `espacio_id`
- **THEN** el sistema rechaza la solicitud con HTTP 422

#### Scenario: Artículo, medida o medida de venta inexistente
- **WHEN** se envía un `articulo_id`, `medida_id` o `medida_venta_id` que no existe o está eliminado
- **THEN** el sistema rechaza la creación con HTTP 400

### Requirement: Obtener ítem de inventario por id

El sistema SHALL exponer un endpoint que devuelva un ítem de inventario por su
`id`, con el mismo shape del listado: los campos propios del ítem (incluido
`minimo_stock`) y los objetos relacionados completos (`articulo` con su
`categoria`, `medida`, `medida_venta` —que puede ser `null`— y `espacio` con su
`deposito`). Si el ítem no existe o fue eliminado, responde HTTP 404.

#### Scenario: Ítem existente
- **WHEN** se consulta un ítem por un `id` válido y no eliminado
- **THEN** el sistema responde HTTP 200 con los datos del ítem y sus objetos relacionados

#### Scenario: Ítem inexistente
- **WHEN** se consulta un ítem por un `id` que no existe
- **THEN** el sistema responde HTTP 404

### Requirement: Actualizar ítem de inventario

El sistema SHALL permitir actualizar `espacio_id`, `fila`, `columna`, `stock`,
`minimo_stock`, `precio_venta` y `medida_venta_id` de un ítem. Se aplican las
mismas reglas de la creación (`>= 0`, espacio obligatorio si stock `> 0`).
`medida_venta_id` puede limpiarse enviando `null` y, cuando se envía un valor,
debe referenciar una medida existente y no eliminada. La combinación artículo +
medida no se modifica.

#### Scenario: Actualización exitosa
- **WHEN** se actualizan `stock`, `precio_venta`, `minimo_stock`, `medida_venta_id` o la ubicación de un ítem existente
- **THEN** el sistema actualiza el ítem y responde HTTP 200 con el ítem actualizado

#### Scenario: Actualización de ítem inexistente
- **WHEN** se intenta actualizar un ítem que no existe o está eliminado
- **THEN** el sistema responde HTTP 404

#### Scenario: Stock negativo al actualizar
- **WHEN** se envía un `stock` menor que 0
- **THEN** el sistema rechaza la solicitud con HTTP 422

#### Scenario: Stock mínimo negativo al actualizar
- **WHEN** se envía un `minimo_stock` menor que 0
- **THEN** el sistema rechaza la solicitud con HTTP 422

#### Scenario: Medida de venta inexistente al actualizar
- **WHEN** se envía un `medida_venta_id` que no existe o está eliminado
- **THEN** el sistema rechaza la solicitud con HTTP 400

#### Scenario: Stock positivo sin espacio al actualizar
- **WHEN** se envía un `stock` mayor que 0 y `espacio_id = null`
- **THEN** el sistema rechaza la solicitud con HTTP 422

### Requirement: Eliminar ítem de inventario (baja lógica)

El sistema SHALL permitir eliminar lógicamente un ítem seteando `deleted_at`;
no elimina físicamente el registro. Si el ítem no existe, responde HTTP 404.

#### Scenario: Baja lógica de ítem existente
- **WHEN** se solicita eliminar un ítem existente
- **THEN** el sistema setea `deleted_at` y responde HTTP 204

#### Scenario: Baja de ítem inexistente
- **WHEN** se solicita eliminar un ítem que no existe
- **THEN** el sistema responde HTTP 404

### Requirement: Listar inventario con stock bajo el mínimo

El sistema SHALL exponer un endpoint que devuelva los ítems de inventario no
eliminados cuyo `stock` es menor que su `minimo_stock`, con paginación. Cada
ítem incluye los mismos campos y objetos relacionados que el listado: `id`,
`fila`, `columna`, `stock`, `minimo_stock`, `precio_venta`, `articulo` (con su
`categoria`), `medida`, `medida_venta` (puede ser `null`) y `espacio` (con su
`deposito`). Los ítems con `minimo_stock == 0` no se consideran bajo mínimo.

#### Scenario: Listado de ítems bajo el mínimo
- **WHEN** se solicita el listado de ítems bajo el mínimo y existen ítems no eliminados con `stock < minimo_stock`
- **THEN** el sistema responde HTTP 200 con una lista paginada de esos ítems con sus objetos relacionados

#### Scenario: Ítems con stock igual o mayor al mínimo quedan excluidos
- **WHEN** se solicita el listado y un ítem tiene `stock >= minimo_stock`
- **THEN** ese ítem no aparece en la respuesta

#### Scenario: Ítems con mínimo en cero quedan excluidos
- **WHEN** se solicita el listado y un ítem tiene `minimo_stock == 0`
- **THEN** ese ítem no aparece en la respuesta

#### Scenario: Ítems eliminados quedan excluidos
- **WHEN** se solicita el listado y existe un ítem eliminado con `stock < minimo_stock`
- **THEN** el ítem eliminado no aparece en la respuesta

#### Scenario: Sin ítems bajo el mínimo
- **WHEN** se solicita el listado y ningún ítem no eliminado tiene `stock < minimo_stock`
- **THEN** el sistema responde HTTP 200 con una lista vacía
