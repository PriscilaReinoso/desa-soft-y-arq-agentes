# Categorias Crud Specification

## Purpose

Permite administrar las categorías de los artículos a través de una API REST.
Es la entidad soporte que valida el `categoria_id` asignado a cada artículo.

## Requirements

### Requirement: Listar categorías

El sistema SHALL exponer un endpoint que devuelva el listado de categorías no
eliminadas, con paginación. Cada categoría incluye `id`, `nombre` y
`descripcion`.

#### Scenario: Listado exitoso de categorías
- **WHEN** se solicita el listado de categorías
- **THEN** el sistema responde HTTP 200 con una lista paginada de categorías no eliminadas

#### Scenario: Listado excluye categorías eliminadas
- **WHEN** se solicita el listado y existe una categoría con `deleted_at` no nulo
- **THEN** la categoría eliminada no aparece en la respuesta

### Requirement: Crear categoría

El sistema SHALL permitir crear una categoría con `nombre` y `descripcion`.
El `nombre` es obligatorio y único.

#### Scenario: Creación exitosa
- **WHEN** se envía un `nombre` único con su `descripcion`
- **THEN** el sistema crea la categoría y responde HTTP 201 con la categoría creada

#### Scenario: Nombre duplicado
- **WHEN** se envía un `nombre` que ya existe
- **THEN** el sistema rechaza la creación con HTTP 409

#### Scenario: Nombre faltante
- **WHEN** se envía una solicitud sin `nombre`
- **THEN** el sistema rechaza la solicitud con HTTP 422
