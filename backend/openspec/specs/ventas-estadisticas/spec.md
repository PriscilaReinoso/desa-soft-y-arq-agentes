# Ventas Estadisticas Specification

## Purpose

Expone datos agregados de la facturación de ventas por período (día, semana,
mes y año) para seguimiento y reportes del negocio.

## Requirements

### Requirement: Resumen de facturación por período

El sistema SHALL exponer un endpoint que devuelva un resumen de ventas para un
período indicado: `dia`, `semana`, `mes` o `año`. El resumen considera únicamente
ventas aprobadas (`aprobado=true`) y no eliminadas, y devuelve el `total`
facturado (suma del campo `total` de las ventas del período), la
`cantidad_ventas` (cantidad de ventas del período) y los límites `desde` y
`hasta` del período consultado. Si no se envía `periodo`, se usa `mes` por
defecto. Si se envía un valor de `periodo` no soportado, el sistema responde
HTTP 422.

#### Scenario: Resumen mensual
- **WHEN** se solicita el resumen con `periodo=mes` y existen ventas aprobadas en el mes actual
- **THEN** el sistema responde HTTP 200 con el `total` igual a la suma de los `total` de esas ventas, la `cantidad_ventas`, y los límites `desde`/`hasta` del mes actual

#### Scenario: Resumen por período diario
- **WHEN** se solicita el resumen con `periodo=dia` y existen ventas aprobadas en el día actual
- **THEN** el sistema responde HTTP 200 con el `total` y la `cantidad_ventas` de las ventas del día actual

#### Scenario: Resumen por período semanal
- **WHEN** se solicita el resumen con `periodo=semana` y existen ventas aprobadas en la semana actual
- **THEN** el sistema responde HTTP 200 con el `total` y la `cantidad_ventas` de las ventas de la semana actual

#### Scenario: Resumen por período anual
- **WHEN** se solicita el resumen con `periodo=año` y existen ventas aprobadas en el año actual
- **THEN** el sistema responde HTTP 200 con el `total` y la `cantidad_ventas` de las ventas del año actual

#### Scenario: Período sin ventas
- **WHEN** se solicita el resumen para un período que no tiene ventas aprobadas
- **THEN** el sistema responde HTTP 200 con `total=0` y `cantidad_ventas=0`

#### Scenario: Excluye ventas no aprobadas y eliminadas
- **WHEN** existen ventas del período con `aprobado=false` o con `deleted_at` no nulo
- **THEN** el sistema no las incluye en el `total` ni en la `cantidad_ventas`

#### Scenario: Período inválido
- **WHEN** se envía un `periodo` distinto de `dia`, `semana`, `mes` o `año`
- **THEN** el sistema responde HTTP 422

#### Scenario: Período por defecto
- **WHEN** se solicita el resumen sin enviar `periodo`
- **THEN** el sistema responde HTTP 200 con el resumen del período `mes` por defecto
