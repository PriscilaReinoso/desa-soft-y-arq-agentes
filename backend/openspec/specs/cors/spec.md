# Cors Specification

## Purpose

Define la política de CORS de la API para que los clientes autorizados del frontend puedan consumir los endpoints desde el navegador, respondiendo correctamente a las preflights `OPTIONS` y adjuntando las cabeceras `Access-Control-Allow-*` requeridas.

## Requirements

### Requirement: Orígenes permitidos

El sistema SHALL aceptar solicitudes desde los orígenes del frontend de desarrollo `http://localhost:5173` y `http://127.0.0.1:5173`, y SHALL exponerlos en la cabecera `Access-Control-Allow-Origin` de las respuestas. La lista de orígenes permitidos SHALL ser configurable por variable de entorno `CORS_ORIGINS`, usando esos dos orígenes como valor por defecto. Si un origen no está en la lista, el sistema no debe exponer la cabecera de origen permitido.

#### Scenario: Solicitud desde un origen autorizado
- **WHEN** el frontend de desarrollo (`http://localhost:5173` o `http://127.0.0.1:5173`) envía una solicitud a la API
- **THEN** la respuesta incluye la cabecera `Access-Control-Allow-Origin` con el origen solicitante

#### Scenario: Origen no autorizado
- **WHEN** un origen ajeno a la lista configurada envía una solicitud a la API
- **THEN** la respuesta no incluye la cabecera `Access-Control-Allow-Origin` correspondiente a ese origen

### Requirement: Preflight OPTIONS

El sistema SHALL responder HTTP 200 a las preflights `OPTIONS` originadas en un origen permitido, declarando en las cabeceras los métodos permitidos (`GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`) y las cabeceras de solicitud permitidas (`Authorization`, `Content-Type`).

#### Scenario: Preflight de login
- **WHEN** un navegador desde un origen permitido envía `OPTIONS /api/v1/auth/login` con `Access-Control-Request-Method: POST` y `Access-Control-Request-Headers: content-type`
- **THEN** el sistema responde HTTP 200 con `Access-Control-Allow-Origin`, `Access-Control-Allow-Methods` y `Access-Control-Allow-Headers` adecuados

### Requirement: Login consumible desde el navegador

El sistema SHALL permitir que el login (`POST /api/v1/auth/login`) sea invocado desde un origen permitido, manteniendo su comportamiento actual de autenticación (HTTP 200 con token o HTTP 401 según credenciales).

#### Scenario: Login desde el navegador
- **WHEN** el frontend envía credenciales válidas desde un origen permitido
- **THEN** el sistema responde HTTP 200 con `access_token` y los datos del usuario, sin bloqueos de CORS
