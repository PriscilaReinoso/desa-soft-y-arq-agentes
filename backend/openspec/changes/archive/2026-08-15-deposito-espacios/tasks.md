## 1. Schemas

- [x] 1.1 Agregar en `app/schemas/deposito.py` el esquema `DepositoDetalleOut(DepositoOut)` con `espacios: list[EspacioOut] = []` (importar `EspacioOut` de `app.schemas.espacio`)

## 2. Endpoint de detalle

- [x] 2.1 En `app/api/v1/depositos.py`, cambiar el `response_model` de `GET /{deposito_id}` a `DepositoDetalleOut` y filtrar de la relationship `espacios` los registros con `deleted_at` no nulo antes de devolver el depósito

## 3. Pruebas

- [x] 3.1 Escribir tests pytest del detalle: depósito con espacios (incluye la lista), depósito sin espacios (lista vacía) y exclusión de espacios eliminados
- [x] 3.2 Ejecutar `python -m pytest tests -q` y corregir fallos (111 passed)
