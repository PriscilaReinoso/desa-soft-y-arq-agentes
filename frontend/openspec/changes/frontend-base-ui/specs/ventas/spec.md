## Purpose

Lista las ventas con filtros por estado y total acumulado de lo filtrado, en esta base con datos de ejemplo.

## ADDED Requirements

### Requirement: Encabezado con total filtrado
El sistema SHALL mostrar el título, el total de las ventas filtradas y un botón "+ Nueva venta" destacado con el color secundario.

#### Scenario: Visualización del encabezado
- **WHEN** el usuario abre la sección de ventas
- **THEN** el sistema muestra el título, el total filtrado y el botón de nueva venta

### Requirement: Filtro por estado
El sistema SHALL ofrecer píldoras de filtro por estado (Todos, Pendiente, En camino, Entregado) que filtran el listado y recalculan el total mostrado.

#### Scenario: Filtrar ventas por estado
- **WHEN** el usuario selecciona un estado en las píldoras
- **THEN** el sistema muestra solo las ventas de ese estado, actualiza el total y resalta la píldora activa

### Requirement: Tabla de ventas
El sistema SHALL mostrar una tabla con número de venta, fecha, cliente, artículos, total, forma de pago, estado como insignia de color y las acciones "Ver" y "PDF" por fila.

#### Scenario: Visualización del estado
- **WHEN** una venta tiene un estado
- **THEN** el sistema lo muestra como insignia con el color correspondiente
