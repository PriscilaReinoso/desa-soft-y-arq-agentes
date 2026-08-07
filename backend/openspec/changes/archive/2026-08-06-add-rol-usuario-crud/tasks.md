## 1. Infraestructura base

- [x] 1.1 Crear `app/core/database.py` con `Base(DeclarativeBase)`, motor y fábrica de sesiones
- [x] 1.2 Crear `app/core/config.py` con la configuración de la aplicación y variables de entorno
- [x] 1.3 Crear `app/exceptions/base.py` con las excepciones de dominio (NotFound, Conflict) y manejadores globales
- [x] 1.4 Registrar los routers en `app/main.py` y configurar la inicialización de la app

## 2. Modelos

- [x] 2.1 Crear `app/models/rol.py` (tabla `rol`: id UUID, nombre único, descripción, timestamps, `deleted_at`)
- [x] 2.2 Crear `app/models/usuario.py` (tabla `usuario`: id UUID, nombre, apellido, email único, password_hash, role_id FK, activo, timestamps, `deleted_at`)
- [x] 2.3 Declarar relación bidireccional `Rol.usuarios` (1:N) en `app/models/rol.py`
- [x] 2.4 Declarar relación `Usuario.role` (N:1) en `app/models/usuario.py`

## 3. Modelos de dominio

- [x] 3.1 Declarar el enum de roles del dominio (ADMIN, CONSULTOR) si aplica

## 4. Interface y Exceptions

- [x] 4.1 Dejar la sección disponible para excepciones de dominio específicas (si se requieren más adelante)

## 5. Modelos para Tests

- [x] 5.1 Configurar los tests y el entorno de base de datos en memoria/test

## 6. Schemas

- [x] 6.1 Crear `app/schemas/rol.py` con esquemas de creación, actualización, respuesta y listado
- [x] 6.2 Crear `app/schemas/usuario.py` con esquemas de creación, actualización, respuesta (sin hash) y listado

## 7. Repositorios

- [x] 7.1 Crear `app/repositories/rol_repository.py`: CRUD + consultas filtrando `deleted_at`
- [x] 7.2 Crear `app/repositories/usuario_repository.py`: CRUD + consulta por email + filtrando `deleted_at`

## 8. Services

- [x] 8.1 Crear `app/services/rol_service.py`: reglas de negocio (unicidad de nombre, 409; validación de existencia, 404)
- [x] 8.2 Crear `app/services/usuario_service.py`: reglas de negocio (validación de rol, unicidad de email, hash de password, ocultar hash en respuestas)

## 9. Routers

- [x] 9.1 Crear `app/api/v1/roles.py`: endpoints GET list, POST, GET by id, PUT, DELETE
- [x] 9.2 Crear `app/api/v1/usuarios.py`: endpoints GET list, POST, GET by id, PUT, DELETE

## 10. Migraciones y Pruebas

- [x] 10.1 Generar y aplicar la migración Alembic para `rol` y `usuario`
- [x] 10.2 Escribir pruebas pytest de CRUD de rol (crear, listar, detalle, actualizar, baja lógica)
- [x] 10.3 Escribir pruebas pytest de CRUD de usuario (incluye validación de rol, unicidad de email, hash oculto, baja lógica)
- [x] 10.4 Ejecutar `pytest` y corregir fallos