# Auth Specification

## Purpose

Seguriza los endpoints existentes del sistema exigiendo un token JWT válido en
el header de cada request, y provee el login de usuarios que emite ese token.
El login solo es útil porque los endpoints protegidos validan un JWT correcto
en el header `Authorization`; además restringe acciones según el rol del
usuario (ADMIN o CONSULTOR).

## Requirements

### Requirement: Login de usuario

El sistema SHALL exponer un endpoint público `POST /api/v1/auth/login` que
reciba `username` y `password`, valide las credenciales contra el usuario
activo y no eliminado y devuelva HTTP 200 con un token JWT de acceso, el tipo
de token, los segundos de expiración y los datos del usuario (id, nombre,
apellido, username, email y rol). Si las credenciales son inválidas, el
usuario está inactivo o fue eliminado, responde HTTP 401 sin revelar cuál
condición se incumplió.

#### Scenario: Login exitoso
- **WHEN** se envían un `username` y `password` correctos de un usuario activo y no eliminado
- **THEN** el sistema responde HTTP 200 con `access_token`, `token_type`, `expires_in` y los datos del usuario

#### Scenario: Credenciales inválidas
- **WHEN** se envían un `username` o `password` incorrectos
- **THEN** el sistema responde HTTP 401 con un mensaje genérico de credenciales inválidas

#### Scenario: Usuario inactivo
- **WHEN** se envían credenciales correctas de un usuario con `activo` en falso
- **THEN** el sistema responde HTTP 401

#### Scenario: Usuario eliminado
- **WHEN** se envían credenciales correctas de un usuario con `deleted_at` no nulo
- **THEN** el sistema responde HTTP 401

#### Scenario: Datos incompletos
- **WHEN** la solicitud no incluye `username` o `password`
- **THEN** el sistema responde HTTP 422

### Requirement: Protección de endpoints con JWT

El sistema SHALL exigir un token JWT válido en el header `Authorization`
(esquema Bearer) para acceder a todos los endpoints de la API, excepto
`POST /api/v1/auth/login`. Un token es válido si tiene una firma correcta, no
está expirado y referencia a un usuario activo y no eliminado. El token
emitido por el login no tiene otro propósito que ser validado por estos
endpoints: solo se concede acceso cuando el header de autorización trae un
JWT correcto. Ante un token ausente, inválido, expirado o que referencia un
usuario inactivo o eliminado, el sistema responde HTTP 401.

#### Scenario: Acceso sin token
- **WHEN** se invoca un endpoint protegido sin header de autorización
- **THEN** el sistema responde HTTP 401

#### Scenario: Token inválido
- **WHEN** se invoca un endpoint protegido con un token mal formado o con firma incorrecta
- **THEN** el sistema responde HTTP 401

#### Scenario: Token expirado
- **WHEN** se invoca un endpoint protegido con un token expirado
- **THEN** el sistema responde HTTP 401

#### Scenario: Token de usuario inactivo o eliminado
- **WHEN** se invoca un endpoint protegido con un token de un usuario inactivo o eliminado
- **THEN** el sistema responde HTTP 401

#### Scenario: Token válido
- **WHEN** se invoca un endpoint protegido con un token válido de un usuario activo y no eliminado
- **THEN** el sistema procesa la solicitud y responde con el código correspondiente

### Requirement: Autorización por rol

El sistema SHALL restringir las acciones de escritura (crear, actualizar y
eliminar) de roles y usuarios al rol `ADMIN`; el rol `CONSULTOR` solo puede
realizar lecturas (listar y obtener por id). Si un usuario autenticado intenta
una acción no permitida para su rol, el sistema responde HTTP 403. La lectura
es permitida para ambos roles.

#### Scenario: ADMIN puede escribir y leer
- **WHEN** un usuario con rol `ADMIN` invoca cualquier endpoint de roles o usuarios (lectura o escritura)
- **THEN** el sistema procesa la solicitud sin restricción de rol

#### Scenario: CONSULTOR puede leer
- **WHEN** un usuario con rol `CONSULTOR` invoca un endpoint de lectura de roles o usuarios
- **THEN** el sistema responde HTTP 200 con el listado o el recurso solicitado

#### Scenario: CONSULTOR no puede escribir
- **WHEN** un usuario con rol `CONSULTOR` invoca un endpoint de creación, actualización o eliminación de roles o usuarios
- **THEN** el sistema responde HTTP 403
