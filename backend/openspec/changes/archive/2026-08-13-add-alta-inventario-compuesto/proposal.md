## Why

Registrar un ítem de inventario exige que existan el artículo, la medida y, si
se define ubicación, el espacio. Hoy eso requeriría varias llamadas y deja el
sistema en estados parciales si algo falla. Se necesita un único alta
transaccional que reciba artículo, medida y espacio nuevos o existentes y
realice rollback si alguno no puede darse de alta.

## What Changes

- Exponer un endpoint de alta compuesta en `api/v1/inventario/alta` (o
  `POST /inventario` con cuerpo extendido) que acepte:
  - `articulo`: existente (con `id`) o nuevo (sin `id`, se da de alta).
  - `medida`: existente (con `id`) o nueva (sin `id`, se da de alta).
  - `espacio`: existente (con `id`), nuevo (sin `id`, con `deposito_id`) u
    omitido.
  - `stock`, `precio_venta`, `fila`, `columna`.
- Reglas de negocio:
  - Si no se envían `stock` ni `espacio`, el inventario se crea con
    `espacio_id = null`, `stock = 0` y `precio_venta >= 0`.
  - Si se envía `espacio` sin `id`, se da de alta el espacio antes del
    inventario.
  - La combinación artículo + medida debe ser única (HTTP 409 en duplicados).
  - Si no se puede dar de alta el artículo, la medida o el espacio, NO se crea
    el inventario y se revierte todo lo insertado (rollback transaccional).
- Implementar la capa completa por responsabilidad: Router → Service →
  Repository, reutilizando los repositorios/servicios de las entidades
  base; la transacción se maneja en una única sesión de base de datos.
- Pruebas con pytest para el alta compuesta exitosa, con entidades nuevas y
  existentes, y para los escenarios de fallo que exigen rollback.

## Capabilities

### New Capabilities
- `alta-inventario`: Alta transaccional de un ítem de inventario que crea o
  reutiliza artículo, medida y espacio en una sola operación, garantizando
  atomicidad (rollback total ante cualquier fallo).

### Modified Capabilities

## Impact

- Código: nuevo `app/api/v1/inventario_alta.py` (o ampliación de
  `inventario.py`), servicio de alta compuesta y ajustes en
  `app/main.py`; se apoya en los CRUD de artículo, medida y espacio ya
  existentes (cambios previos).
- Base de datos: sin nuevas tablas; usa `articulo`, `medida`, `espacio` e
  `inventario`.
- Seguridad: endpoint con JWT; restringido a `ADMIN`.
- Pruebas: suite de tests de alta compuesta y rollback.
