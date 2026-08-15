## MODIFIED Requirements

### Requirement: Obtener depósito por id
El sistema SHALL exponer un endpoint que devuelva un depósito por su `id`, incluyendo la lista de sus espacios no eliminados (`id`, `tipo`, `descripcion`, `deposito_id`, `max_fila` y `max_columna`). Si el depósito no existe o fue eliminado, responde HTTP 404.

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
