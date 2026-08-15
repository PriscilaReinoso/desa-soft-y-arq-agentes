## MODIFIED Requirements

### Requirement: Encabezado de bienvenida
El sistema SHALL mostrar en el inicio un saludo de bienvenida con el nombre del usuario autenticado y la fecha del día actual (dinámica, calculada en el cliente).

#### Scenario: Visualización del encabezado
- **WHEN** el usuario abre la sección de inicio
- **THEN** el sistema muestra el saludo con el nombre del usuario y la fecha real del día

### Requirement: Indicadores clave (KPIs)
El sistema SHALL mostrar cuatro tarjetas de indicadores (Artículos en stock, Ventas del mes, Órdenes pendientes y Stock bajo mínimo), cada una con icono, valor destacado en tipografía monoespaciada y color propio, etiqueta y variación. El valor del indicador "Artículos en stock" SHALL ser la cantidad real de artículos calculada por el backend. Si el cálculo del backend no está disponible, el sistema SHALL calcular la cantidad de artículos distintos a partir del listado de inventario (`GET /api/v1/inventarios`). Los indicadores "Ventas del mes", "Órdenes pendientes" y "Stock bajo mínimo" SHALL mostrar un placeholder "Sin información" con su variación indicando que el dato no está disponible, porque el backend aún no expone esos datos.

#### Scenario: Valor real de artículos en stock
- **WHEN** el usuario abre la sección de inicio y el backend provee el cálculo
- **THEN** el sistema muestra en el KPI "Artículos en stock" la cantidad real de artículos calculada por el backend

#### Scenario: Cálculo no disponible con fallback
- **WHEN** el usuario abre la sección de inicio y el cálculo del backend no está disponible
- **THEN** el sistema muestra en el KPI "Artículos en stock" la cantidad de artículos distintos calculada a partir del listado de inventario

#### Scenario: Indicadores sin datos disponibles
- **WHEN** el usuario abre la sección de inicio
- **THEN** los KPIs "Ventas del mes", "Órdenes pendientes" y "Stock bajo mínimo" muestran "Sin información" indicando que el dato no está disponible

### Requirement: Ventas recientes
El sistema SHALL mostrar en la sección de ventas recientes un estado vacío "Sin información disponible" en lugar de datos mock, porque el backend aún no tiene métodos relacionados a ventas, y mantener el enlace "Ver todas" que navega a la sección de ventas.

#### Scenario: Estado vacío de ventas recientes
- **WHEN** el usuario abre la sección de inicio
- **THEN** el sistema muestra el estado vacío "Sin información disponible" en lugar de filas de ventas

#### Scenario: Navegación a ventas
- **WHEN** el usuario hace clic en "Ver todas"
- **THEN** el sistema navega a la sección de ventas

### Requirement: Stock bajo mínimo
El sistema SHALL mostrar en el bloque de stock bajo mínimo un placeholder "Sin información" indicando que el dato no está disponible, porque el modelo de inventario de la API no expone un stock mínimo, y mantener el enlace "Ver" que navega a la sección de inventario.

#### Scenario: Estado sin información de stock bajo mínimo
- **WHEN** el usuario abre la sección de inicio
- **THEN** el sistema muestra el placeholder "Sin información" en el bloque de stock bajo mínimo

#### Scenario: Navegación a inventario
- **WHEN** el usuario hace clic en "Ver"
- **THEN** el sistema navega a la sección de inventario
