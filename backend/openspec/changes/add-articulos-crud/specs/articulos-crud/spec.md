## Purpose

Permite administrar los artículos a la venta a través de una API REST:
listado, creación, consulta, actualización y baja lógica. Cada artículo se
asocia a una categoría y es la base del inventario y de las listas de precios.

## ADDED Requirements

### Requirement: Listar artículos

El sistema SHALL exponer un endpoint que devuelva el listado de artículos no
eliminados, con paginación. Cada artículo incluye `id`, `nombre`,
`descripcion`, `categoria_id` y las marcas de auditoría `created_at`,
`updated_at`, `deleted_at`.

#### Scenario: Listado exitoso de artículos
- **WHEN** se solicita el listado de artículos
- **THEN** el sistema responde HTTP 200 con una lista paginada de artículos no eliminados

#### Scenario: Listado excluye artículos eliminados
- **WHEN** se solicita el listado y existe un artículo con `deleted_at` no nulo
- **THEN** el artículo eliminado no aparece en la respuesta

### Requirement: Crear artículo

El sistema SHALL permitir crear un artículo con `nombre`, `descripcion` y
`categoria_id`. El `nombre` es obligatorio y único; el `categoria_id` debe
referenciar una categoría existente y no eliminada.

#### Scenario: Creación exitosa
- **WHEN** se envía un `nombre` único, una `descripcion` y un `categoria_id` válido
- **THEN** el sistema crea el artículo y responde HTTP 201 con el artículo creado

#### Scenario: Nombre duplicado
- **WHEN** se envía un `nombre` que ya existe
- **THEN** el sistema rechaza la creación con HTTP 409

#### Scenario: Categoría inexistente
- **WHEN** se envía un `categoria_id` que no existe o está eliminado
- **THEN** el sistema rechaza la creación con HTTP 400

#### Scenario: Nombre faltante
- **WHEN** se envía una solicitud sin `nombre`
- **THEN** el sistema rechaza la solicitud con HTTP 422

### Requirement: Obtener artículo por id

El sistema SHALL exponer un endpoint que devuelva un artículo por su `id`. Si
el artículo no existe o fue eliminado, responde HTTP 404.

#### Scenario: Artículo existente
- **WHEN** se consulta un artículo por un `id` válido y no eliminado
- **THEN** el sistema responde HTTP 200 con los datos del artículo

#### Scenario: Artículo inexistente
- **WHEN** se consulta un artículo por un `id` que no existe
- **THEN** el sistema responde HTTP 404

### Requirement: Actualizar artículo

El sistema SHALL permitir actualizar `nombre`, `descripcion` y `categoria_id`
de un artículo. El `nombre` propuesto no puede colisionar con otro artículo y
el `categoria_id` debe referenciar una categoría existente.

#### Scenario: Actualización exitosa
- **WHEN** se envía un nombre, descripción o categoría nuevos para un artículo existente
- **THEN** el sistema actualiza el artículo y responde HTTP 200 con el artículo actualizado

#### Scenario: Actualización de artículo inexistente
- **WHEN** se intenta actualizar un artículo que no existe o está eliminado
- **THEN** el sistema responde HTTP 404

#### Scenario: Nombre en conflicto
- **WHEN** se envía un `nombre` que ya pertenece a otro artículo
- **THEN** el sistema responde HTTP 409

#### Scenario: Categoría inexistente al actualizar
- **WHEN** se envía un `categoria_id` que no existe o está eliminado
- **THEN** el sistema responde HTTP 400

### Requirement: Eliminar artículo (baja lógica)

El sistema SHALL permitir eliminar lógicamente un artículo seteando
`deleted_at`; no elimina físicamente el registro. Si el artículo no existe,
responde HTTP 404. Una vez eliminado, deja de aparecer en listados y
consultas.

#### Scenario: Baja lógica de artículo existente
- **WHEN** se solicita eliminar un artículo existente
- **THEN** el sistema setea `deleted_at` y responde HTTP 204

#### Scenario: Baja de artículo inexistente
- **WHEN** se solicita eliminar un artículo que no existe
- **THEN** el sistema responde HTTP 404
