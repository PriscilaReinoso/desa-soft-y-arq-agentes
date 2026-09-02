## Why

La API de ventas solo permite operaciones CRUD; no existe forma de obtener
datos agregados de ventas. El equipo necesita un endpoint que devuelva el
total facturado de ventas por período (día, semana, mes, año) para
seguimiento y reportes. Requerimiento originado en la Historia de Jira
[IF-38 - api ventas](https://reinoso-yesica-priscila.atlassian.net/browse/IF-38).

## What Changes

- Nuevo endpoint `GET /ventas/estadisticas` que devuelve un resumen de ventas
  para un período configurable (`dia`, `semana`, `mes`, `año`).
- El resumen incluye el `total` facturado (suma del campo `total` de las
  ventas aprobadas del período), la `cantidad_ventas` y los límites `desde`/
  `hasta` del período consultado.
- Solo se consideran ventas aprobadas (`aprobado=true`) y no eliminadas.
- Períodos sin ventas responden `total=0` y `cantidad_ventas=0` (HTTP 200).
- Se agrega la lógica de negocio y consulta agregada en la capa de servicio y
  repositorio de ventas, sin tocar el CRUD existente.

## Capabilities

### New Capabilities
- `ventas-estadisticas`: resumen de facturación de ventas por período (día, semana, mes, año).

### Modified Capabilities
<!-- Ninguna: el cambio agrega comportamiento nuevo, no modifica requisitos de la spec `ventas` existente. -->

## Impact

- `app/api/v1/ventas.py`: nuevo endpoint de estadísticas bajo el prefijo
  `/ventas`.
- `app/services/venta_service.py`: nuevo método de negocio para el resumen por
  período.
- `app/repositories/venta_repository.py`: nueva consulta agregada (SUM y COUNT)
  sobre ventas aprobadas filtradas por rango de fechas.
- `app/schemas/venta.py`: nuevos modelos Pydantic de request/response para el
  resumen.
- Sin migraciones de base de datos; sin cambios de esquema.
- No requiere cambios en la spec `ventas` existente.