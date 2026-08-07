# Usuario CRUD Specification

## Purpose

Permite administrar los usuarios del sistema a través de una API REST:
listado, creación, consulta, actualización y baja lógica. Administra la
asignación de rol y el hasheo de contraseña, sin exponer el hash en ninguna
respuesta.

## Requirements

### Requirement: Listar usuarios

El sistema SHALL exponer un endpoint que devuelva el listado de usuarios no
eliminados, con paginación. Cada usuario incluye `id`, `nombre`, `apellido`,
`username`, `email`, `role_id`, `activo`, `created_at`, `updated_at` y
`deleted_at`. El campo `password_hash` nunca aparece en las respuestas.

#### Scenario: Listado exitoso de usuarios
- **WHEN** se solicita el listado de usuarios
- **THEN** el sistema responde HTTP 200 con una lista paginada de usuarios no eliminados

#### Scenario: Listado no expone hashes de contraseña
- **WHEN** se solicita el listado de usuarios
- **THEN** ninguna respuesta incluye el campo `password_hash`

#### Scenario: Listado excluye usuarios eliminados
- **WHEN** se solicita el listado y existe un usuario con `deleted_at` no nulo
- **THEN** el usuario eliminado no aparece en la respuesta

### Requirement: Crear usuario

El sistema SHALL permitir crear un usuario con `nombre`, `apellido`,
`username`, `email`, `password` y `role_id`. El `username` y el `email` son
únicos; el `role_id` debe referenciar un rol existente y no eliminado. La
contraseña se almacena como `password_hash` generado por un algoritmo de hash
seguro. El hash no se devuelve en la respuesta.

#### Scenario: Creación exitosa
- **WHEN** se envían datos válidos con un `username`, `email` y `role_id` válidos
- **THEN** el sistema crea el usuario con la contraseña hasheada y responde HTTP 201 sin el hash

#### Scenario: Username duplicado
- **WHEN** se envía un `username` que ya existe
- **THEN** el sistema rechaza la creación con HTTP 409

#### Scenario: Email duplicado
- **WHEN** se envía un `email` que ya existe
- **THEN** el sistema rechaza la creación con HTTP 409

#### Scenario: Rol inexistente
- **WHEN** se envía un `role_id` que no existe o está eliminado
- **THEN** el sistema rechaza la creación con HTTP 400

#### Scenario: Datos incompletos
- **WHEN** se envía una solicitud sin `nombre`, `apellido`, `username`, `email`, `password` o `role_id`
- **THEN** el sistema rechaza la solicitud con HTTP 422

### Requirement: Obtener usuario por id

El sistema SHALL exponer un endpoint que devuelva un usuario por su `id`, sin
incluir `password_hash`. Si el usuario no existe o fue eliminado, responde
HTTP 404.

#### Scenario: Usuario existente
- **WHEN** se consulta un usuario por un `id` válido y no eliminado
- **THEN** el sistema responde HTTP 200 con los datos del usuario sin el hash

#### Scenario: Usuario inexistente
- **WHEN** se consulta un usuario por un `id` que no existe
- **THEN** el sistema responde HTTP 404

### Requirement: Actualizar usuario

El sistema SHALL permitir actualizar `nombre`, `apellido`, `username`,
`email`, `activo`, `role_id` y, opcionalmente, `password`. Si `password` se
envía, se re-hashea. El `username` y el `email` permanecen únicos; un valor en
uso por otro usuario se rechaza con HTTP 409. El `role_id` debe referir a un
rol existente. El hash nunca se devuelve.

#### Scenario: Actualización exitosa sin cambio de contraseña
- **WHEN** se actualizan campos distintos de `password`
- **THEN** el sistema actualiza el usuario y responde HTTP 200 sin el hash

#### Scenario: Actualización con cambio de contraseña
- **WHEN** se envía un nuevo `password`
- **THEN** el sistema re-hashea la contraseña y responde HTTP 200 sin el hash

#### Scenario: Username en conflicto
- **WHEN** se envía un `username` que ya pertenece a otro usuario
- **THEN** el sistema responde HTTP 409

#### Scenario: Email en conflicto
- **WHEN** se envía un `email` que ya pertenece a otro usuario
- **THEN** el sistema responde HTTP 409

#### Scenario: Rol inexistente
- **WHEN** se envía un `role_id` que no existe
- **THEN** el sistema responde HTTP 400

#### Scenario: Usuario inexistente
- **WHEN** se intenta actualizar un usuario que no existe o está eliminado
- **THEN** el sistema responde HTTP 404

### Requirement: Eliminar usuario (baja lógica)

El sistema SHALL permitir eliminar lógicamente un usuario seteando
`deleted_at`, sin borrado físico. Si el usuario no existe, responde HTTP 404.
Tras la baja, el usuario deja de aparecer en listados y consultas.

#### Scenario: Baja lógica de usuario existente
- **WHEN** se solicita eliminar un usuario existente
- **THEN** el sistema setea `deleted_at` y responde HTTP 204

#### Scenario: Baja de usuario inexistente
- **WHEN** se solicita eliminar un usuario que no existe
- **THEN** el sistema responde HTTP 404
