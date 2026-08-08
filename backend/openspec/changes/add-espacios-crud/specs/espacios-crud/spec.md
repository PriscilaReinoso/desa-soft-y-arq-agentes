## Purpose

Permite administrar los espacios físicos de almacenamiento a través de una API
REST: listado, creación, consulta, actualización y baja lógica. Cada espacio
pertenece a un depósito y define una grilla (filas y columnas) donde se
ubican los artículos del inventario.

## ADDED Requirements

### Requirement: Listar espacios

El sistema SHALL exponer un endpoint que devuelva el listado de espacios no
eliminados, con paginación. Cada espacio incluye `id`, `tipo`, `descripcion`,
`deposito_id`, `max_fila`, `max_columna` y las marcas de auditoría
`created_at`, `updated_at`, `deleted_at`.

#### Scenario: Listado exitoso de espacios
- **WHEN** se solicita el listado de espacios
- **THEN** el sistema responde HTTP 200 con una lista paginada de espacios no eliminados

#### Scenario: Listado excluye espacios eliminados
- **WHEN** se solicita el listado y existe un espacio con `deleted_at` no nulo
- **THEN** el espacio eliminado no aparece en la respuesta

### Requirement: Crear espacio

El sistema SHALL permitir crear un espacio con `tipo`, `descripcion`,
`deposito_id`, `max_fila` y `max_columna`. El `deposito_id` es obligatorio y
debe referenciar un depósito existente y no eliminado. Al crear un espacio, el
sistema incrementa `cantidad_espacios` del depósito padre.

#### Scenario: Creación exitosa
- **WHEN** se envía un `deposito_id` válido con `tipo`, `max_fila` y `max_columna`
- **THEN** el sistema crea el espacio, incrementa `cantidad_espacios` del depósito y responde HTTP 201

#### Scenario: Depósito inexistente
- **WHEN** se envía un `deposito_id` que no existe o está eliminado
- **THEN** el sistema rechaza la creación con HTTP 400

#### Scenario: Campos faltantes
- **WHEN** se envía una solicitud sin `deposito_id`, `max_fila` o `max_columna`
- **THEN** el sistema rechaza la solicitud con HTTP 422

### Requirement: Obtener espacio por id

El sistema SHALL exponer un endpoint que devuelva un espacio por su `id`. Si
el espacio no existe o fue eliminado, responde HTTP 404.

#### Scenario: Espacio existente
- **WHEN** se consulta un espacio por un `id` válido y no eliminado
- **THEN** el sistema responde HTTP 200 con los datos del espacio

#### Scenario: Espacio inexistente
- **WHEN** se consulta un espacio por un `id` que no existe
- **THEN** el sistema responde HTTP 404

### Requirement: Actualizar espacio

El sistema SHALL permitir actualizar `tipo`, `descripcion`, `deposito_id`,
`max_fila` y `max_columna` de un espacio. El `deposito_id` debe referenciar un
depósito existente.

#### Scenario: Actualización exitosa
- **WHEN** se envían campos nuevos para un espacio existente
- **THEN** el sistema actualiza el espacio y responde HTTP 200 con el espacio actualizado

#### Scenario: Actualización de espacio inexistente
- **WHEN** se intenta actualizar un espacio que no existe o está eliminado
- **THEN** el sistema responde HTTP 404

#### Scenario: Depósito inexistente al actualizar
- **WHEN** se envía un `deposito_id` que no existe o está eliminado
- **THEN** el sistema responde HTTP 400

### Requirement: Eliminar espacio (baja lógica)

El sistema SHALL permitir eliminar lógicamente un espacio seteando
`deleted_at`; no elimina físicamente el registro. Al eliminar, el sistema
decrementa `cantidad_espacios` del depósito padre. Si el espacio no existe,
responde HTTP 404.

#### Scenario: Baja lógica de espacio existente
- **WHEN** se solicita eliminar un espacio existente
- **THEN** el sistema setea `deleted_at`, decrementa `cantidad_espacios` del depósito y responde HTTP 204

#### Scenario: Baja de espacio inexistente
- **WHEN** se solicita eliminar un espacio que no existe
- **THEN** el sistema responde HTTP 404
