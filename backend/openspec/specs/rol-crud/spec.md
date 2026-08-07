## Purpose

Permite administrar los roles del sistema a través de una API REST,
habilitando su listado, creación, consulta, actualización y baja lógica para
soportar el control de acceso por roles.

## ADDED Requirements

### Requirement: Listar roles

El sistema SHALL exponer un endpoint que devuelva el listado de roles no
eliminados, con paginación. Cada rol incluye `id`, `nombre`, `descripcion` y
las marcas de auditoría `created_at`, `updated_at`, `deleted_at`.

#### Scenario: Listado exitoso de roles
- **WHEN** se solicita el listado de roles
- **THEN** el sistema responde 200 con una lista paginada de roles no eliminados

#### Scenario: Listado excluye roles eliminados
- **WHEN** se solicita el listado de roles y existe un rol con `deleted_at` no nulo
- **THEN** el rol eliminado no aparece en la respuesta

### Requirement: Crear rol

El sistema SHALL permitir crear un rol a partir de `nombre` y `descripcion`.
El `nombre` es obligatorio y único; si ya existe, la creación se rechaza con
HTTP 409.

#### Scenario: Creación exitosa
- **WHEN** se envía un `nombre` único con su `descripcion`
- **THEN** el sistema crea el rol y responde HTTP 201 con el rol creado

#### Scenario: Nombre duplicado
- **WHEN** se envía un `nombre` que ya existe
- **THEN** el sistema rechaza la creación con HTTP 409

#### Scenario: Nombre faltante
- **WHEN** se envía una solicitud sin `nombre`
- **THEN** el sistema rechaza la solicitud con HTTP 422

### Requirement: Obtener rol por id

El sistema SHALL exponer un endpoint que devuelva un rol por su `id`. Si el
rol no existe o fue eliminado, responde HTTP 404.

#### Scenario: Rol existente
- **WHEN** se consulta un rol por un `id` válido y no eliminado
- **THEN** el sistema responde HTTP 200 con los datos del rol

#### Scenario: Rol inexistente
- **WHEN** se consulta un rol por un `id` que no existe
- **THEN** el sistema responde HTTP 404

### Requirement: Actualizar rol

El sistema SHALL permitir actualizar `nombre` y `descripcion` de un rol. Si el
`nombre` propuesto colisiona con otro rol, responde HTTP 409.

#### Scenario: Actualización exitosa
- **WHEN** se envía un nombre o descripción nuevos para un rol existente
- **THEN** el sistema actualiza el rol y responde HTTP 200 con el rol actualizado

#### Scenario: Actualización de rol inexistente
- **WHEN** se intenta actualizar un rol que no existe o está eliminado
- **THEN** el sistema responde HTTP 404

### Requirement: Eliminar rol (baja lógica)

El sistema SHALL permitir eliminar lógicamente un rol seteando `deleted_at`;
no elimina físicamente el registro. Si el rol no existe, responde HTTP 404.
Una vez eliminado, deja de aparecer en listados y consultas.

#### Scenario: Baja lógica de rol existente
- **WHEN** se solicita eliminar un rol existente
- **THEN** el sistema setea `deleted_at` y responde HTTP 204

#### Scenario: Baja de rol inexistente
- **WHEN** se solicita eliminar un rol que no existe
- **THEN** el sistema responde HTTP 404
