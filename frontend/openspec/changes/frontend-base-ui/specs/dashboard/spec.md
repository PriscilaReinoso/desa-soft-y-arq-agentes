## Purpose

Página de inicio con el resumen operativo del día: indicadores clave, ventas recientes y alertas de stock bajo con acceso al asistente.

## ADDED Requirements

### Requirement: Encabezado de bienvenida
El sistema SHALL mostrar en el inicio un saludo de bienvenida con el nombre del usuario y un resumen del día.

#### Scenario: Visualización del encabezado
- **WHEN** el usuario abre la sección de inicio
- **THEN** el sistema muestra el saludo y el resumen del día

### Requirement: Indicadores clave (KPIs)
El sistema SHALL mostrar cuatro tarjetas de indicadores (Artículos en stock, Ventas del mes, Órdenes pendientes y Stock bajo mínimo), cada una con icono, valor destacado en tipografía monoespaciada y color propio, etiqueta y variación.

#### Scenario: Visualización de KPIs
- **WHEN** el usuario abre la sección de inicio
- **THEN** el sistema muestra las cuatro tarjetas con icono, valor, etiqueta y variación

### Requirement: Ventas recientes
El sistema SHALL mostrar una tabla de ventas recientes con número de venta, cliente, cantidad de artículos, total y estado como insignia de color, más un enlace "Ver todas" que navega a la sección de ventas.

#### Scenario: Navegación a ventas
- **WHEN** el usuario hace clic en "Ver todas"
- **THEN** el sistema navega a la sección de ventas

### Requirement: Stock bajo mínimo
El sistema SHALL mostrar la lista de artículos bajo su stock mínimo con nombre, stock disponible, mínimo, porcentaje y barra de progreso coloreada según el umbral, más un enlace "Ver" que navega a la sección de inventario.

#### Scenario: Navegación a inventario
- **WHEN** el usuario hace clic en "Ver"
- **THEN** el sistema navega a la sección de inventario

### Requirement: Acceso al asistente
El sistema SHALL ofrecer un botón "Consultar al Asistente IA" que navega a la sección del asistente.

#### Scenario: Acceso al asistente desde el inicio
- **WHEN** el usuario hace clic en "Consultar al Asistente IA"
- **THEN** el sistema navega a la sección de asistente
