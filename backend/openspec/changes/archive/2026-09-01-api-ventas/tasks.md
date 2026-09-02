## 1. Esquemas

- [x] 1.1 Agregar enum `PeriodoVentas` (dia, semana, mes, año) en `app/schemas/venta.py`
- [x] 1.2 Agregar schema de respuesta `ResumenVentasOut` (`periodo`, `desde`, `hasta`, `total`, `cantidad_ventas`) en `app/schemas/venta.py`

## 2. Repositorio

- [x] 2.1 Agregar método `resumen_por_periodo(desde, hasta)` en `VentaRepository`: SUM de `total` y COUNT de cabeceras con `aprobado=true`, `deleted_at is None` y `fecha >= desde` y `fecha < hasta`, devolviendo `(total, cantidad)`; normalizar `None` a 0
- [x] 2.2 Agregar utilidad para calcular el rango `desde`/`hasta` de un período (dia/semana/mes/año, límite superior exclusivo) reutilizando `utcnow`

## 3. Servicio

- [x] 3.1 Agregar método `obtener_resumen(periodo)` en `VentaService`: calcula el rango, delega en el repositorio y arma el `ResumenVentasOut`

## 4. Endpoint

- [x] 4.1 Agregar endpoint `GET /ventas/estadisticas` en `app/api/v1/ventas.py` con query param `periodo` (default `mes`), autenticado vía `get_current_usuario`, response_model `ResumenVentasOut`
- [x] 4.2 Verificar que un `periodo` inválido devuelve HTTP 422 (validación por Enum)

## 5. Tests

- [x] 5.1 Agregar tests en `tests/test_venta.py` para el resumen mensual con ventas aprobadas
- [x] 5.2 Agregar tests para períodos dia/semana/año
- [x] 5.3 Agregar test de período sin ventas (total=0, cantidad=0)
- [x] 5.4 Agregar test de exclusión de ventas no aprobadas y eliminadas
- [x] 5.5 Agregar test de período inválido (HTTP 422) y de período por defecto (mes)
- [x] 5.6 Ejecutar `pytest tests/test_venta.py` y corregir fallas

## 6. Validación

- [x] 6.1 Ejecutar la suite completa de tests (`pytest`) sin regresiones
- [x] 6.2 Validar el endpoint con un request real (swagger o curl) para cada período