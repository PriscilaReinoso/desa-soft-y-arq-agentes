## 1. Modelos

- [x] 1.1 Crear `app/models/espacio.py` (tabla `espacio`: id UUID, tipo, descripción, deposito_id FK, max_fila, max_columna, timestamps, `deleted_at`)
- [x] 1.2 Declarar la relación bidireccional `Espacio.deposito` (N:1) completando `Deposito.espacios`

## 2. Schemas

- [x] 2.1 Crear `app/schemas/espacio.py` con esquemas de creación, actualización, respuesta y listado

## 3. Repositorios

- [x] 3.1 Crear `app/repositories/espacio_repository.py`: CRUD + consultas filtrando `deleted_at`

## 4. Services

- [x] 4.1 Crear `app/services/espacio_service.py`: reglas de negocio (validación de depósito, 400/404; sincronización de `deposito.cantidad_espacios` al crear y eliminar)

## 5. Routers

- [x] 5.1 Crear `app/api/v1/espacios.py`: endpoints GET list, POST, GET by id, PUT, DELETE
- [x] 5.2 Registrar el router en `app/main.py`

## 6. Migraciones y Pruebas

- [x] 6.1 Generar y aplicar la migración Alembic para `espacio`
- [x] 6.2 Escribir pruebas pytest del CRUD de espacios (incluye validación de depósito y sincronización de `cantidad_espacios`)
- [x] 6.3 Ejecutar `pytest` y corregir fallos
