## Purpose

Permite administrar el inventario a través de una API REST: listado, creación,
consulta, actualización y baja lógica. El inventario asocia un artículo con su
medida, stock, precio de venta y ubicación (espacio, fila y columna).

## ADDED Requirements

### Requirement: Listar inventario

El sistema SHALL exponer un endpoint que devuelva el listado de ítems de
inventario no eliminados, con paginación. Cada ítem incluye `id`, `fila`,
`columna`, `stock`, `precio_venta` y los objetos relacionados completos:
`articulo` (con su `categoria`), `medida` y `espacio` (con su `deposito`). Los
identificadores de los relacionados solo aparecen dentro de su objeto
(`articulo.id`, `medida.id`, `espacio.id`).

#### Scenario: Listado exitoso de inventario
- **WHEN** se solicita el listado de inventario
- **THEN** el sistema responde HTTP 200 con una lista paginada de ítems no eliminados

#### Scenario: Listado excluye ítems eliminados
- **WHEN** se solicita el listado y existe un ítem con `deleted_at` no nulo
- **THEN** el ítem eliminado no aparece en la respuesta

#### Scenario: Listado incluye los objetos relacionados
- **WHEN** se solicita el listado y los ítems tienen artículo, medida y espacio asignados
- **THEN** cada ítem incluye el objeto `articulo` con su `categoria`, el objeto `medida` y el objeto `espacio` con su `deposito`

#### Scenario: Ítem sin espacio devuelve espacio nulo
- **WHEN** un ítem tiene `espacio_id` nulo
- **THEN** el campo `espacio` del ítem es `null`

### Requirement: Crear ítem de inventario

El sistema SHALL permitir crear un ítem de inventario con `articulo_id`,
`medida_id` y, opcionalmente, `espacio_id`, `fila`, `columna`, `stock` y
`precio_venta`. Reglas:

- `articulo_id` y `medida_id` deben referenciar entidades existentes y no
  eliminadas.
- La combinación `articulo_id` + `medida_id` es única.
- `stock` y `precio_venta` deben ser `>= 0`.
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

#### Scenario: Precio negativo
- **WHEN** se envía un `precio_venta` menor que 0
- **THEN** el sistema rechaza la solicitud con HTTP 422

#### Scenario: Fila o columna negativa
- **WHEN** se envía una `fila` o `columna` menor que 0
- **THEN** el sistema rechaza la solicitud con HTTP 422

#### Scenario: Stock positivo sin espacio asignado
- **WHEN** se envía un `stock` mayor que 0 sin `espacio_id`
- **THEN** el sistema rechaza la solicitud con HTTP 422

#### Scenario: Artículo o medida inexistente
- **WHEN** se envía un `articulo_id` o `medida_id` que no existe o está eliminado
- **THEN** el sistema rechaza la creación con HTTP 400

### Requirement: Obtener ítem de inventario por id

El sistema SHALL exponer un endpoint que devuelva un ítem de inventario por su
`id`, con el mismo shape del listado: los campos propios del ítem y los
objetos relacionados completos (`articulo` con su `categoria`, `medida` y
`espacio` con su `deposito`). Si el ítem no existe o fue eliminado, responde
HTTP 404.

#### Scenario: Ítem existente
- **WHEN** se consulta un ítem por un `id` válido y no eliminado
- **THEN** el sistema responde HTTP 200 con los datos del ítem y sus objetos relacionados

#### Scenario: Ítem inexistente
- **WHEN** se consulta un ítem por un `id` que no existe
- **THEN** el sistema responde HTTP 404

### Requirement: Actualizar ítem de inventario

El sistema SHALL permitir actualizar `espacio_id`, `fila`, `columna`, `stock`
y `precio_venta` de un ítem. Se aplican las mismas reglas de la creación
(`>= 0`, espacio obligatorio si stock `> 0`). La combinación artículo + medida
no se modifica.

#### Scenario: Actualización exitosa
- **WHEN** se actualizan `stock`, `precio_venta` o la ubicación de un ítem existente
- **THEN** el sistema actualiza el ítem y responde HTTP 200 con el ítem actualizado

#### Scenario: Actualización de ítem inexistente
- **WHEN** se intenta actualizar un ítem que no existe o está eliminado
- **THEN** el sistema responde HTTP 404

#### Scenario: Stock negativo al actualizar
- **WHEN** se envía un `stock` menor que 0
- **THEN** el sistema rechaza la solicitud con HTTP 422

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
