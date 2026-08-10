## Purpose

Permite a los usuarios autenticarse contra el backend mediante JWT, conservar la sesión y acceder únicamente a las secciones protegidas de la aplicación.

## ADDED Requirements

### Requirement: Inicio de sesión con credenciales
El sistema SHALL ofrecer una pantalla de login con campos de usuario y contraseña que envía las credenciales a `POST /api/v1/auth/login`. Ante el éxito, SHALL almacenar el token de acceso y los datos del usuario; ante el fracaso SHALL mostrar un mensaje de error y no otorgar acceso.

#### Scenario: Credenciales correctas
- **WHEN** el usuario ingresa usuario y contraseña válidos y confirma el envío
- **THEN** el sistema autentica contra la API, guarda la sesión y redirige a la sección de inicio

#### Scenario: Credenciales incorrectas
- **WHEN** el usuario ingresa credenciales inválidas
- **THEN** el sistema muestra un mensaje de error y permanece en la pantalla de login sin guardar sesión

#### Scenario: Backend no disponible
- **WHEN** la API no responde al intentar iniciar sesión
- **THEN** el sistema muestra un mensaje de error indicando que no se pudo conectar

### Requirement: Persistencia y uso de la sesión
El sistema SHALL conservar la sesión entre recargas de página y SHALL adjuntar el token en el encabezado `Authorization: Bearer` de las peticiones a la API.

#### Scenario: Recarga mantiene la sesión
- **WHEN** un usuario autenticado recarga la página
- **THEN** el sistema restaura la sesión desde el almacenamiento local y no le pide volver a iniciar sesión

#### Scenario: Peticiones autenticadas
- **WHEN** la aplicación realiza una petición a un endpoint protegido
- **THEN** la petición incluye el token de acceso en el encabezado de autorización

### Requirement: Protección de rutas
El sistema SHALL redirigir a la pantalla de login a quien intente acceder a una sección protegida sin sesión y SHALL redirigir a la sección de inicio a un usuario autenticado que visite la pantalla de login.

#### Scenario: Acceso sin sesión
- **WHEN** un usuario sin sesión intenta abrir una sección protegida
- **THEN** el sistema lo redirige a la pantalla de login

#### Scenario: Usuario autenticado visita el login
- **WHEN** un usuario con sesión activa abre la pantalla de login
- **THEN** el sistema lo redirige a la sección de inicio

### Requirement: Cierre de sesión
El sistema SHALL permitir finalizar la sesión, eliminando el token y los datos del usuario y devolviendo al usuario a la pantalla de login.

#### Scenario: El usuario cierra sesión
- **WHEN** un usuario autenticado cierra la sesión
- **THEN** el sistema borra el token y los datos del usuario y lo redirige al login
