## MODIFIED Requirements

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
