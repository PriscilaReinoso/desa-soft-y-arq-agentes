## Purpose

Permite administrar los métodos de pago disponibles en el sistema a través de
una API REST: alta, lectura, actualización y baja lógica.

## ADDED Requirements

### Requirement: Crear método de pago

El sistema SHALL permitir crear un método de pago con `nombre` (único) y
`descripcion` opcional.

#### Scenario: Creación exitosa
- **WHEN** se envía un método de pago con `nombre` no existente y `descripcion` válidos
- **THEN** el sistema crea el método de pago y responde HTTP 201 con el método creado

#### Scenario: Método de pago duplicado por nombre
- **WHEN** se envía un `nombre` que ya existe en otro método de pago no eliminado
- **THEN** el sistema rechaza la creación con HTTP 409

### Requirement: Listar métodos de pago

El sistema SHALL exponer un endpoint que devuelva el listado de métodos de pago
no eliminados, con paginación.

#### Scenario: Listado exitoso
- **WHEN** se solicita el listado de métodos de pago
- **THEN** el sistema responde HTTP 200 con una lista paginada de métodos de pago no eliminados

#### Scenario: Listado excluye métodos eliminados
- **WHEN** se solicita el listado y existe un método de pago con `deleted_at` no nulo
- **THEN** el método de pago eliminado no aparece en la respuesta

### Requirement: Obtener método de pago por id

El sistema SHALL exponer un endpoint que devuelva un método de pago por su
`id`. Si no existe o fue eliminado, responde HTTP 404.

#### Scenario: Método de pago existente
- **WHEN** se consulta un método de pago por un `id` válido y no eliminado
- **THEN** el sistema responde HTTP 200 con los datos del método de pago

#### Scenario: Método de pago inexistente
- **WHEN** se consulta un método de pago por un `id` que no existe o está eliminado
- **THEN** el sistema responde HTTP 404

### Requirement: Actualizar método de pago

El sistema SHALL permitir actualizar `nombre` y `descripcion` de un método de
pago. Se aplica la regla de unicidad de `nombre`, excluyendo al propio método.

#### Scenario: Actualización exitosa
- **WHEN** se actualizan datos de un método de pago existente sin conflictos de unicidad
- **THEN** el sistema actualiza el método de pago y responde HTTP 200 con el método actualizado

#### Scenario: Actualización de método inexistente
- **WHEN** se intenta actualizar un método de pago que no existe o está eliminado
- **THEN** el sistema responde HTTP 404

#### Scenario: Actualización con nombre duplicado
- **WHEN** se actualiza un método de pago con un `nombre` que ya pertenece a otro método no eliminado
- **THEN** el sistema rechaza la actualización con HTTP 409

### Requirement: Eliminar método de pago (baja lógica)

El sistema SHALL permitir eliminar lógicamente un método de pago seteando
`deleted_at`; no elimina físicamente el registro. Si no existe, responde HTTP
404.

#### Scenario: Baja lógica de método existente
- **WHEN** se solicita eliminar un método de pago existente
- **THEN** el sistema setea `deleted_at` y responde HTTP 204

#### Scenario: Baja de método inexistente
- **WHEN** se solicita eliminar un método de pago que no existe
- **THEN** el sistema responde HTTP 404
