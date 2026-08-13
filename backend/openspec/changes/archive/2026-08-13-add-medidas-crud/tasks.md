## 1. Modelos

- [x] 1.1 Crear `app/models/medida.py` (tabla `medida`: id UUID, unidad_medida, medida, UNIQUE compuesto, timestamps, `deleted_at`)

## 2. Schemas

- [x] 2.1 Crear `app/schemas/medida.py` con esquemas de creación, actualización, respuesta y listado

## 3. Repositorios

- [x] 3.1 Crear `app/repositories/medida_repository.py`: CRUD + consulta por combinación (unidad_medida, medida) + filtrando `deleted_at`

## 4. Services

- [x] 4.1 Crear `app/services/medida_service.py`: reglas de negocio (unicidad de combinación, 409; validación de existencia, 404)

## 5. Routers

- [x] 5.1 Crear `app/api/v1/medidas.py`: endpoints GET list, POST, GET by id, PUT, DELETE
- [x] 5.2 Registrar el router en `app/main.py`

## 6. Migraciones y Pruebas

- [x] 6.1 Generar y aplicar la migración Alembic para `medida`
- [x] 6.2 Escribir pruebas pytest del CRUD de medidas (incluye unicidad de combinación y baja lógica)
- [x] 6.3 Ejecutar `pytest` y corregir fallos
