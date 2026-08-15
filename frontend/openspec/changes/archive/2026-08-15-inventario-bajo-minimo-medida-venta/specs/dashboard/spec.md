## MODIFIED Requirements

### Requirement: Indicadores clave (KPIs)
El sistema SHALL mostrar cuatro tarjetas de indicadores (Artículos en stock, Ventas del mes, Órdenes pendientes y Stock bajo mínimo), cada una con icono, valor destacado en tipografía monoespaciada y color propio, etiqueta y variación. El valor del indicador "Stock bajo mínimo" SHALL ser la cantidad de ítems de inventario con stock menor a su mínimo, obtenida del endpoint `GET /api/v1/inventarios/bajo-minimo`; si el dato no está disponible, SHALL mostrar "Sin información".

#### Scenario: Valor real de stock bajo mínimo
- **WHEN** el backend provee el listado de ítems bajo mínimo
- **THEN** el KPI "Stock bajo mínimo" muestra la cantidad de ítems bajo mínimo

#### Scenario: Dato no disponible
- **WHEN** el listado de ítems bajo mínimo no está disponible o falla
- **THEN** el KPI "Stock bajo mínimo" muestra "Sin información"

### Requirement: Stock bajo mínimo
El sistema SHALL mostrar la lista de artículos bajo su stock mínimo con nombre, stock disponible, mínimo, porcentaje y barra de progreso coloreada según el umbral, más un enlace "Ver" que navega a la sección de inventario. La lista SHALL provenir del endpoint `GET /api/v1/inventarios/bajo-minimo`; si no hay ítems bajo mínimo o el dato no está disponible, SHALL mostrar el texto "Sin información".

#### Scenario: Listado real de ítems bajo mínimo
- **WHEN** el backend provee ítems bajo mínimo
- **THEN** el sistema muestra cada ítem con su nombre, stock disponible, mínimo, porcentaje y barra de progreso coloreada según el umbral

#### Scenario: Sin ítems bajo el mínimo
- **WHEN** no existen ítems bajo mínimo o el dato no está disponible
- **THEN** el sistema muestra "Sin información" en el bloque

#### Scenario: Navegación a inventario
- **WHEN** el usuario hace clic en "Ver"
- **THEN** el sistema navega a la sección de inventario
