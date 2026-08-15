# Depositos Crud Specification

## Purpose

Permite administrar los depósitos de la ferretería a través de una API REST:
listado, creación, consulta, actualización y baja lógica. Cada depósito agrupa
los espacios físicos de almacenamiento.

## Requirements

### Requirement: Listar depósitos

El sistema SHALL exponer un endpoint que devuelva el listado de depósitos no
eliminados, con paginación. Cada depósito incluye `id`, `nombre`,
`descripcion`, `direccion` y `cantidad_espacios`.

#### Scenario: Listado exitoso de depósitos
- **WHEN** se solicita el listado de depósitos
- **THEN** el sistema responde HTTP 200 con una lista paginada de depósitos no eliminados

#### Scenario: Listado excluye depósitos eliminados
- **WHEN** se solicita el listado y existe un depósito con `deleted_at` no nulo
- **THEN** el depósito eliminado no aparece en la respuesta

### Requirement: Crear depósito

El sistema SHALL permitir crear un depósito con `nombre`, `descripcion` y
`direccion`. El `nombre` es obligatorio. `cantidad_espacios` se inicializa en
0 y no se administra directamente por el usuario.

#### Scenario: Creación exitosa
- **WHEN** se envía un `nombre` válido con su `descripcion` y `direccion`
- **THEN** el sistema crea el depósito con `cantidad_espacios` en 0 y responde HTTP 201

#### Scenario: Nombre faltante
- **WHEN** se envía una solicitud sin `nombre`
- **THEN** el sistema rechaza la solicitud con HTTP 422

### Requirement: Obtener depósito por id

El sistema SHALL exponer un endpoint que devuelva un depósito por su `id`,
incluyendo la lista de sus espacios no eliminados (`id`, `tipo`, `descripcion`,
`deposito_id`, `max_fila` y `max_columna`). Si el depósito no existe o fue
eliminado, responde HTTP 404.

#### Scenario: Depósito existente con espacios
- **WHEN** se consulta un depósito por un `id` válido y no eliminado que tiene espacios
- **THEN** el sistema responde HTTP 200 con los datos del depósito y su lista de espacios no eliminados

#### Scenario: Depósito existente sin espacios
- **WHEN** se consulta un depósito por un `id` válido y no eliminado sin espacios
- **THEN** el sistema responde HTTP 200 con los datos del depósito y una lista de espacios vacía

#### Scenario: La respuesta excluye espacios eliminados
- **WHEN** el depósito tiene espacios con `deleted_at` no nulo
- **THEN** esos espacios no aparecen en la lista de la respuesta

#### Scenario: Depósito inexistente
- **WHEN** se consulta un depósito por un `id` que no existe
- **THEN** el sistema responde HTTP 404

### Requirement: Actualizar depósito

El sistema SHALL permitir actualizar `nombre`, `descripcion` y `direccion` de
un depósito.

#### Scenario: Actualización exitosa
- **WHEN** se envían campos nuevos para un depósito existente
- **THEN** el sistema actualiza el depósito y responde HTTP 200 con el depósito actualizado

#### Scenario: Actualización de depósito inexistente
- **WHEN** se intenta actualizar un depósito que no existe o está eliminado
- **THEN** el sistema responde HTTP 404

### Requirement: Eliminar depósito (baja lógica)

El sistema SHALL permitir eliminar lógicamente un depósito seteando
`deleted_at`; no elimina físicamente el registro. Si el depósito no existe,
responde HTTP 404. Una vez eliminado, deja de aparecer en listados y
consultas.

#### Scenario: Baja lógica de depósito existente
- **WHEN** se solicita eliminar un depósito existente
- **THEN** el sistema setea `deleted_at` y responde HTTP 204

#### Scenario: Baja de depósito inexistente
- **WHEN** se solicita eliminar un depósito que no existe
- **THEN** el sistema responde HTTP 404
