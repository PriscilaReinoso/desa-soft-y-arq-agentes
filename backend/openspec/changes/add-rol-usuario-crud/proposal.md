## Why

El backend es un scaffold sin endpoints: no existen modelos, repositorios,
servicios ni rutas para los dominios más básicos del sistema. Es necesario
asentar la capa de roles y usuarios, ya que son la base de la autenticación
JWT y del control de acceso por roles (`ADMIN` y `CONSULTOR`) que el resto de
los módulos va a consumir.

## What Changes

- Crear el modelo `Rol` y sus esquemas Pydantic de CRUD, habilitando el
  endpoint `api/v1/roles`.
- Crear el modelo `Usuario` con `role_id` y sus esquemas Pydantic de CRUD,
  habilitando el endpoint `api/v1/usuarios`. El `password_hash` nunca se
  expone en las respuestas; el hash se genera al crear o cambiar la clave.
- Implementar la capa completa por responsabilidad: Router → Service →
  Repository → SQLAlchemy, con modelos en singular y relaciones bidireccionales.
- Borrado lógico (`deleted_at`) en ambos modelos; las listas excluyen los
  registros eliminados.
- Migración Alembic que materializa las tablas `rol` y `usuario`.
- Pruebas con pytest para el CRUD de ambas entidades.

## Capabilities

### New Capabilities
- `rol-crud`: CRUD completo de la entidad rol (+ listado, detalle, alta,
  actualización y baja lógica).
- `usuario-crud`: CRUD completo de la entidad usuario con asignación de rol,
  hash de contraseña oculto y baja lógica.

### Modified Capabilities

## Impact

- Código: `app/models/rol.py`, `app/models/usuario.py`, nuevos
  `repositories/`, `services/`, `schemas/` y `app/api/v1/roles.py` +
  `usuarios.py`, registro en `app/main.py`.
- Base de datos: nuevas tablas `rol` y `usuario` (migración Alembiz).
- Seguridad: el hash de contraseña es responsabilidad del servicio.
- Pruebas: nuevas suites de tests para ambos CRUDs.