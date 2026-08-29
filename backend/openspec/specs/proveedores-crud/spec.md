# Proveedores Crud Specification

## Purpose

Permite administrar los proveedores de la ferretería a través de una API REST:
alta, lectura, actualización y baja lógica, con asociación a categorías.

## Requirements

### Requirement: Crear proveedor

El sistema SHALL permitir crear un proveedor con `nombre`, `apellido`,
`telefono`, `direccion` y, opcionalmente, una lista de `categoria_id` que lo
asocie en `proveedor_categoria`. El `telefono` y el par `nombre` + `apellido`
funcionan como identificadores de existencia: si ya existe un proveedor con el
mismo `telefono` o con el mismo `nombre` + `apellido`, se rechaza el alta.

#### Scenario: Creación exitosa con categorías
- **WHEN** se envía un proveedor con `telefono`, `nombre`, `apellido` y `categoria_id` válidos que no existen previamente
- **THEN** el sistema crea el proveedor y sus asociaciones a categorías y responde HTTP 201 con el proveedor creado

#### Scenario: Creación sin categorías
- **WHEN** se envía un proveedor sin `categoria_id`
- **THEN** el sistema crea el proveedor sin asociaciones y responde HTTP 201

#### Scenario: Proveedor duplicado por teléfono
- **WHEN** se envía un proveedor cuyo `telefono` ya existe en otro proveedor no eliminado
- **THEN** el sistema rechaza el alta con HTTP 409

#### Scenario: Proveedor duplicado por nombre y apellido
- **WHEN** se envía un proveedor cuyo `nombre` y `apellido` ya existen en otro proveedor no eliminado
- **THEN** el sistema rechaza el alta con HTTP 409

#### Scenario: Categoría inexistente
- **WHEN** se envía un `categoria_id` que no existe o está eliminado
- **THEN** el sistema rechaza el alta con HTTP 400

### Requirement: Listar proveedores

El sistema SHALL exponer un endpoint que devuelva el listado de proveedores no
eliminados, con paginación. Cada proveedor incluye `id`, `nombre`, `apellido`,
`telefono`, `direccion` y la lista de `categorias` asociadas.

#### Scenario: Listado exitoso
- **WHEN** se solicita el listado de proveedores
- **THEN** el sistema responde HTTP 200 con una lista paginada de proveedores no eliminados

#### Scenario: Listado excluye proveedores eliminados
- **WHEN** se solicita el listado y existe un proveedor con `deleted_at` no nulo
- **THEN** el proveedor eliminado no aparece en la respuesta

#### Scenario: Listado incluye las categorías asociadas
- **WHEN** se solicita el listado y los proveedores tienen categorías asociadas
- **THEN** cada proveedor incluye la lista de objetos `categoria` asociados

### Requirement: Obtener proveedor por id

El sistema SHALL exponer un endpoint que devuelva un proveedor por su `id`,
con el mismo shape del listado (incluida la lista de `categorias`). Si el
proveedor no existe o fue eliminado, responde HTTP 404.

#### Scenario: Proveedor existente
- **WHEN** se consulta un proveedor por un `id` válido y no eliminado
- **THEN** el sistema responde HTTP 200 con los datos del proveedor y sus categorías

#### Scenario: Proveedor inexistente
- **WHEN** se consulta un proveedor por un `id` que no existe o está eliminado
- **THEN** el sistema responde HTTP 404

### Requirement: Actualizar proveedor

El sistema SHALL permitir actualizar `nombre`, `apellido`, `telefono`,
`direccion` y las categorías asociadas de un proveedor. Se aplican las mismas
reglas de unicidad por `telefono` y por `nombre` + `apellido`, excluyendo al
propio proveedor.

#### Scenario: Actualización exitosa
- **WHEN** se actualizan datos de un proveedor existente sin conflictos de unicidad
- **THEN** el sistema actualiza el proveedor y responde HTTP 200 con el proveedor actualizado

#### Scenario: Actualización de proveedor inexistente
- **WHEN** se intenta actualizar un proveedor que no existe o está eliminado
- **THEN** el sistema responde HTTP 404

#### Scenario: Actualización con teléfono duplicado
- **WHEN** se actualiza un proveedor con un `telefono` que ya pertenece a otro proveedor no eliminado
- **THEN** el sistema rechaza la actualización con HTTP 409

### Requirement: Eliminar proveedor (baja lógica)

El sistema SHALL permitir eliminar lógicamente un proveedor seteando
`deleted_at`; no elimina físicamente el registro. Si el proveedor no existe,
responde HTTP 404.

#### Scenario: Baja lógica de proveedor existente
- **WHEN** se solicita eliminar un proveedor existente
- **THEN** el sistema setea `deleted_at` y responde HTTP 204

#### Scenario: Baja de proveedor inexistente
- **WHEN** se solicita eliminar un proveedor que no existe
- **THEN** el sistema responde HTTP 404