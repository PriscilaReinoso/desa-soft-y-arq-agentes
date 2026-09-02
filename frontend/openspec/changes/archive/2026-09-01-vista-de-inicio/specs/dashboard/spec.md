## MODIFIED Requirements

### Requirement: Indicadores clave (KPIs)
El sistema SHALL mostrar cuatro tarjetas de indicadores (Artículos en stock, Ventas del mes, Ventas del día y Artículos stock bajo), cada una con icono, valor destacado en tipografía monoespaciada y color propio, etiqueta y variación. El valor del indicador "Artículos en stock" SHALL ser la cantidad real de artículos calculada por el backend; si el cálculo del backend no está disponible, SHALL calcular la cantidad de artículos distintos a partir del listado de inventario (`GET /api/v1/inventarios`). El indicador "Ventas del mes" SHALL mostrar el total de ventas del mes actual obtenido del resumen de ventas (`GET /api/v1/ventas/estadisticas?periodo=mes`). El indicador "Ventas del día" (renombrado desde "Órdenes pendientes") SHALL mostrar el total de ventas del día actual obtenido del resumen de ventas (`GET /api/v1/ventas/estadisticas?periodo=dia`). El indicador "Artículos stock bajo" (renombrado desde "Stock bajo mínimo") SHALL ser la cantidad de ítems de inventario con stock menor a su mínimo, obtenida del endpoint `GET /api/v1/inventarios/bajo-minimo`. Si un indicador de ventas (día o mes) no está disponible o falla, el sistema SHALL mostrar "Sin información" en ese indicador sin afectar al resto de los indicadores.

#### Scenario: Valor real de ventas del mes
- **WHEN** el usuario abre la sección de inicio y el resumen de ventas del mes está disponible
- **THEN** el indicador "Ventas del mes" muestra el total de ventas del mes actual

#### Scenario: Valor real de ventas del día
- **WHEN** el usuario abre la sección de inicio y el resumen de ventas del día está disponible
- **THEN** el indicador "Ventas del día" muestra el total de ventas del día actual

#### Scenario: Indicador de ventas sin datos disponibles
- **WHEN** el resumen de ventas (día o mes) no está disponible o falla
- **THEN** el indicador correspondiente muestra "Sin información" y el resto de los indicadores se renderiza normalmente

#### Scenario: Indicadores renombrados
- **WHEN** el usuario abre la sección de inicio
- **THEN** el sistema muestra las etiquetas "Ventas del día" (antes "Órdenes pendientes") y "Artículos stock bajo" (antes "Stock bajo mínimo") en los indicadores correspondientes

#### Scenario: Valor real de artículos en stock
- **WHEN** el usuario abre la sección de inicio y el backend provee el cálculo
- **THEN** el sistema muestra en el KPI "Artículos en stock" la cantidad real de artículos calculada por el backend

#### Scenario: Valor real de artículos stock bajo
- **WHEN** el backend provee el listado de ítems bajo mínimo
- **THEN** el indicador "Artículos stock bajo" muestra la cantidad de ítems bajo mínimo

#### Scenario: Dato de stock bajo no disponible
- **WHEN** el listado de ítems bajo mínimo no está disponible o falla
- **THEN** el indicador "Artículos stock bajo" muestra "Sin información"

### Requirement: Ventas recientes
El sistema SHALL mostrar en la sección de ventas recientes las 5 ventas más recientes (una fila por venta), con fecha, artículo, cantidad y total, ordenadas por fecha descendente. La lista SHALL provenir del listado de ventas del backend (`GET /api/v1/ventas`); si no hay ventas o el dato no está disponible, SHALL mostrar el estado vacío "Sin información disponible". El sistema SHALL mantener el enlace "Ver todas" que navega a la sección de ventas. Para ventas con varios artículos, la fila SHALL mostrar el artículo principal y, en caso de ser necesario, un resumen del resto.

#### Scenario: Listado de ventas recientes
- **WHEN** el backend provee ventas
- **THEN** el sistema muestra hasta 5 filas, cada una con la fecha, el artículo, la cantidad y el total de la venta, ordenadas de la más reciente a la más antigua

#### Scenario: Sin ventas disponibles
- **WHEN** no existen ventas o el listado no está disponible
- **THEN** el sistema muestra el estado vacío "Sin información disponible" en la sección

#### Scenario: Navegación a ventas
- **WHEN** el usuario hace clic en "Ver todas"
- **THEN** el sistema navega a la sección de ventas