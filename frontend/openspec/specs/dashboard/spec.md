# Dashboard Specification

## Purpose

Página de inicio con el resumen operativo del día: indicadores clave, ventas recientes y alertas de stock bajo con acceso al asistente.

## Requirements

### Requirement: Encabezado de bienvenida
El sistema SHALL mostrar en el inicio un saludo de bienvenida con el nombre del usuario autenticado y la fecha del día actual (dinámica, calculada en el cliente).

#### Scenario: Visualización del encabezado
- **WHEN** el usuario abre la sección de inicio
- **THEN** el sistema muestra el saludo con el nombre del usuario y la fecha real del día

### Requirement: Indicadores clave (KPIs)
El sistema SHALL mostrar cuatro tarjetas de indicadores (Artículos en stock, Ventas del mes, Órdenes pendientes y Stock bajo mínimo), cada una con icono, valor destacado en tipografía monoespaciada y color propio, etiqueta y variación. El valor del indicador "Artículos en stock" SHALL ser la cantidad real de artículos calculada por el backend; si el cálculo del backend no está disponible, SHALL calcular la cantidad de artículos distintos a partir del listado de inventario (`GET /api/v1/inventarios`). El valor del indicador "Stock bajo mínimo" SHALL ser la cantidad de ítems de inventario con stock menor a su mínimo, obtenida del endpoint `GET /api/v1/inventarios/bajo-minimo`; si el dato no está disponible, SHALL mostrar "Sin información". Los indicadores "Ventas del mes" y "Órdenes pendientes" SHALL mostrar un placeholder "Sin información" con su variación indicando que el dato no está disponible, porque el backend aún no expone esos datos.

#### Scenario: Valor real de artículos en stock
- **WHEN** el usuario abre la sección de inicio y el backend provee el cálculo
- **THEN** el sistema muestra en el KPI "Artículos en stock" la cantidad real de artículos calculada por el backend

#### Scenario: Cálculo no disponible con fallback
- **WHEN** el usuario abre la sección de inicio y el cálculo del backend no está disponible
- **THEN** el sistema muestra en el KPI "Artículos en stock" la cantidad de artículos distintos calculada a partir del listado de inventario

#### Scenario: Valor real de stock bajo mínimo
- **WHEN** el backend provee el listado de ítems bajo mínimo
- **THEN** el KPI "Stock bajo mínimo" muestra la cantidad de ítems bajo mínimo

#### Scenario: Dato no disponible
- **WHEN** el listado de ítems bajo mínimo no está disponible o falla
- **THEN** el KPI "Stock bajo mínimo" muestra "Sin información"

#### Scenario: Indicadores sin datos disponibles
- **WHEN** el usuario abre la sección de inicio
- **THEN** los KPIs "Ventas del mes" y "Órdenes pendientes" muestran "Sin información" indicando que el dato no está disponible

### Requirement: Ventas recientes
El sistema SHALL mostrar en la sección de ventas recientes un estado vacío "Sin información disponible" en lugar de datos mock, porque el backend aún no tiene métodos relacionados a ventas, y mantener el enlace "Ver todas" que navega a la sección de ventas.

#### Scenario: Estado vacío de ventas recientes
- **WHEN** el usuario abre la sección de inicio
- **THEN** el sistema muestra el estado vacío "Sin información disponible" en lugar de filas de ventas

#### Scenario: Navegación a ventas
- **WHEN** el usuario hace clic en "Ver todas"
- **THEN** el sistema navega a la sección de ventas

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

### Requirement: Acceso al asistente
El sistema SHALL ofrecer un botón "Consultar al Asistente IA" que navega a la sección del asistente.

#### Scenario: Acceso al asistente desde el inicio
- **WHEN** el usuario hace clic en "Consultar al Asistente IA"
- **THEN** el sistema navega a la sección de asistente
