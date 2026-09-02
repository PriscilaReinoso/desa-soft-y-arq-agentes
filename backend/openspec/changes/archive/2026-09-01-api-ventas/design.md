## Context

El módulo de ventas expone CRUD en `app/api/v1/ventas.py` con autenticación JWT
via `get_current_usuario`. La capa de acceso a datos (`VentaRepository`) ya
centraliza las consultas sobre `VentaCabecera`. Los modelos no tienen campo de
costo, y por definición del requerimiento (ver proposal.md) el `total` es la
suma de facturación, no ganancia neta. La fecha de la venta está en `fecha`
(UTC, timestamp). No hay necesidad de migraciones.

## Goals / Non-Goals

**Goals:**
- Exponer un endpoint `GET /ventas/estadisticas` con `periodo` como query param
  (`dia|semana|mes|año`, default `mes`).
- Calcular `total` (SUM de `VentaCabecera.total`) y `cantidad_ventas` (COUNT)
  sobre ventas aprobadas y no eliminadas dentro del rango del período.
- Mantener la arquitectura por capas (router → service → repository).

**Non-Goals:**
- No se agrega campo de costo ni cálculo de ganancia neta.
- No se modifican las operaciones CRUD existentes de ventas ni la spec `ventas`.
- No se agregan reportes por artículo/categoría, ni exportación, ni gráficos.

## Decisions

### Endpoint de resumen con parámetro `periodo` (en vez de 4 endpoints)
Un solo endpoint parametrizado, `GET /ventas/estadisticas?periodo=mes`, es más
simple y extensible que cuatro rutas separadas. Se valida el valor con un Enum
Pydantic para obtener HTTP 422 automáticamente.
Alternativa considerada: `/ventas/resumen/{periodo}` como path param. Se
descarta para mantener el filtro opcional (con default `mes`) como query param.

### Solo ventas aprobadas y no eliminadas
El `total` refleja facturación realizada. Se filtra `aprobado=true` y
`deleted_at is None`. Alternativa considerada: incluir todas las ventas; se
descarta porque las ventas no aprobadas no representan ingreso consolidado.

### Rango del período calculado con la fecha actual del servidor
`desde`/`hasta` se derivan del período respecto de "hoy":
- `dia`: 00:00:00 → 23:59:59.999 de hoy.
- `semana`: inicio de la semana (lunes) → fin de hoy.
- `mes`: día 1 del mes → fin de hoy.
- `año`: 1 de enero → fin de hoy.
El filtro usa `VentaCabecera.fecha` (UTC). Alternativa considerada: ventana de
últimas 24h/7d; se descarta para alinear con lectura de "mes/semana/día/año"
currente del negocio.

### Agregado en el repositorio (SUM + COUNT) en una sola query
`VentaRepository` agrega un método que ejecuta un `select(func.sum(...),
func.count(...))` filtrado por rango, `aprobado` y `deleted_at`, devolviendo
un `tuple[Decimal, int]`. Alternativa considerada: traer las cabeceras y su
sumar en Python; se descarta por ineficiencia.

### Esquemas Pydantic dedicados
`PeriodoVentas` (Enum), `ResumenVentasOut` (schema de respuesta con `periodo`,
`desde`, `hasta`, `total`, `cantidad_ventas`). Se agregan a
`app/schemas/venta.py` junto a los existentes.

## Risks / Trade-offs

[Fusión de zonas horarias] → La fecha se guarda en UTC (`utcnow`); el rango
del período se calcula contra el reloj del servidor. Documentar que el "día"
es según la zona del servidor; ok para esta etapa, se puede migrar a tz
configurable más adelante si el negocio lo pide.

[Fechas límite de fin de período] → Usar 23:59:59.999 (o `<` inicio del
siguiente período) evita perder ventas del último instante. El diseño usa
consultas con `<` al inicio del período siguiente para ser robusto.

[Sin ventas aprobadas] → La query agregada devuelve `None`; el servicio debe
normalizar a `total=0`, `cantidad_ventas=0`.

## Migration Plan

No requiere migración de datos. Despliegue normal de la API: se agregan
esquemas, método de repositorio, método de servicio y endpoint; rollback es
revertir los commits del change.