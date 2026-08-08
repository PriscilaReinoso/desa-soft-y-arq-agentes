## Purpose

Permite administrar las medidas de los artículos a través de una API REST:
listado, creación, consulta, actualización y baja lógica. La combinación de
unidad y medida es única y sustenta el inventario y las listas de precios.

## ADDED Requirements

### Requirement: Listar medidas

El sistema SHALL exponer un endpoint que devuelva el listado de medidas no
eliminadas, con paginación. Cada medida incluye `id`, `unidad_medida`,
`medida` y las marcas de auditoría `created_at`, `updated_at`, `deleted_at`.

#### Scenario: Listado exitoso de medidas
- **WHEN** se solicita el listado de medidas
- **THEN** el sistema responde HTTP 200 con una lista paginada de medidas no eliminadas

#### Scenario: Listado excluye medidas eliminadas
- **WHEN** se solicita el listado y existe una medida con `deleted_at` no nulo
- **THEN** la medida eliminada no aparece en la respuesta

### Requirement: Crear medida

El sistema SHALL permitir crear una medida con `unidad_medida` y `medida`.
Ambos campos son obligatorios y la combinación `unidad_medida` + `medida` es
única.

#### Scenario: Creación exitosa
- **WHEN** se envía una `unidad_medida` y una `medida` cuya combinación es única
- **THEN** el sistema crea la medida y responde HTTP 201 con la medida creada

#### Scenario: Combinación duplicada
- **WHEN** se envía una `unidad_medida` y una `medida` que ya existen
- **THEN** el sistema rechaza la creación con HTTP 409

#### Scenario: Campos faltantes
- **WHEN** se envía una solicitud sin `unidad_medida` o sin `medida`
- **THEN** el sistema rechaza la solicitud con HTTP 422

### Requirement: Obtener medida por id

El sistema SHALL exponer un endpoint que devuelva una medida por su `id`. Si
la medida no existe o fue eliminada, responde HTTP 404.

#### Scenario: Medida existente
- **WHEN** se consulta una medida por un `id` válido y no eliminado
- **THEN** el sistema responde HTTP 200 con los datos de la medida

#### Scenario: Medida inexistente
- **WHEN** se consulta una medida por un `id` que no existe
- **THEN** el sistema responde HTTP 404

### Requirement: Actualizar medida

El sistema SHALL permitir actualizar `unidad_medida` y `medida` de una medida.
La combinación propuesta no puede colisionar con otra medida.

#### Scenario: Actualización exitosa
- **WHEN** se envía una `unidad_medida` o una `medida` nuevas para una medida existente
- **THEN** el sistema actualiza la medida y responde HTTP 200 con la medida actualizada

#### Scenario: Actualización de medida inexistente
- **WHEN** se intenta actualizar una medida que no existe o está eliminada
- **THEN** el sistema responde HTTP 404

#### Scenario: Combinación en conflicto
- **WHEN** se envía una `unidad_medida` y una `medida` que ya pertenecen a otra medida
- **THEN** el sistema responde HTTP 409

### Requirement: Eliminar medida (baja lógica)

El sistema SHALL permitir eliminar lógicamente una medida seteando
`deleted_at`; no elimina físicamente el registro. Si la medida no existe,
responde HTTP 404. Una vez eliminada, deja de aparecer en listados y
consultas.

#### Scenario: Baja lógica de medida existente
- **WHEN** se solicita eliminar una medida existente
- **THEN** el sistema setea `deleted_at` y responde HTTP 204

#### Scenario: Baja de medida inexistente
- **WHEN** se solicita eliminar una medida que no existe
- **THEN** el sistema responde HTTP 404
