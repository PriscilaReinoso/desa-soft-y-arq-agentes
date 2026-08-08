## 1. Modelos

- [x] 1.1 Crear `app/models/deposito.py` (tabla `deposito`: id UUID, nombre, descripción, dirección, cantidad_espacios default 0, timestamps, `deleted_at`)
- [x] 1.2 Diferir la relación `Deposito.espacios` (1:N) al change `add-espacios-crud` (Espacio aún no existe; declararla ahora rompería la configuración del mapper)

## 2. Schemas

- [x] 2.1 Crear `app/schemas/deposito.py` con esquemas de creación, actualización, respuesta y listado (sin `cantidad_espacios` editable)

## 3. Repositorios

- [x] 3.1 Crear `app/repositories/deposito_repository.py`: CRUD + consultas filtrando `deleted_at`

## 4. Services

- [x] 4.1 Crear `app/services/deposito_service.py`: reglas de negocio (validación de existencia, 404)

## 5. Routers

- [x] 5.1 Crear `app/api/v1/depositos.py`: endpoints GET list, POST, GET by id, PUT, DELETE
- [x] 5.2 Registrar el router en `app/main.py`

## 6. Migraciones y Pruebas

- [x] 6.1 Generar y aplicar la migración Alembic para `deposito`
- [x] 6.2 Escribir pruebas pytest del CRUD de depósitos (crear con cantidad_espacios 0, actualizar, baja lógica)
- [x] 6.3 Ejecutar `pytest` y corregir fallos
