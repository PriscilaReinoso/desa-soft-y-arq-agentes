# Migracion Alembic Specification

## Purpose

Asegura que el esquema de la base de datos compartida se cree/actualice
mediante las migraciones de alembic dentro del compose, ejecutadas antes de
que la API comience a servir, de forma idempotente y sin exponer credenciales.

## ADDED Requirements

### Requirement: Migración antes de servir la API
El compose SHALL ejecutar las migraciones de alembic (`alembic upgrade head`)
sobre la base de datos compartida antes de que el backend arranque su servidor
HTTP, de modo que las tablas existan cuando la API comience a atender.

#### Scenario: El backend espera a la migración
- **WHEN** se levanta el stack
- **THEN** la migración de esquema se ejecuta y concluye con éxito antes de que el backend levante uvicorn

#### Scenario: El esquema se crea si faltan tablas
- **WHEN** la base de datos está vacía y se levanta el stack
- **THEN** las migraciones crean las tablas del esquema y la API deja de reportar errores por tablas inexistentes

### Requirement: Migración idempotente
El compose SHALL permitir ejecutar la migración de forma repetida sin errores
ni efectos no deseados sobre el esquema ya aplicado.

#### Scenario: Re-aplicar la migración es seguro
- **WHEN** el stack se levanta más de una vez con la misma base de datos
- **THEN** la migración no re-ejecuta pasos ya aplicados y finaliza sin errores

### Requirement: Configuración por variables de entorno
El servicio de migración SHALL conectarse a la base de datos compartida
exclusivamente mediante variables de entorno, sin credenciales en texto plano.

#### Scenario: Sin credenciales en archivos versionados
- **WHEN** se inspecciona el compose y los archivos versionados
- **THEN** las credenciales de la base de datos solo provienen de variables de entorno no versionadas
