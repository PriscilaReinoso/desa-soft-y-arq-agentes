## Purpose

Lista los proveedores con sus datos de contacto, categorías y saldo en tarjetas con acciones, en esta base con datos de ejemplo.

## ADDED Requirements

### Requirement: Encabezado y alta de proveedor
El sistema SHALL mostrar el título, la cantidad de proveedores registrados y un botón "+ Nuevo proveedor".

#### Scenario: Visualización del encabezado
- **WHEN** el usuario abre la sección de proveedores
- **THEN** el sistema muestra el título, la cantidad de proveedores y el botón de alta

### Requirement: Búsqueda de proveedores
El sistema SHALL permitir buscar proveedores por nombre o por persona de contacto.

#### Scenario: Búsqueda por nombre o contacto
- **WHEN** el usuario escribe un término en el campo de búsqueda
- **THEN** el sistema muestra únicamente los proveedores cuyo nombre o contacto contienen el término

### Requirement: Tarjetas de proveedor
El sistema SHALL mostrar cada proveedor en una tarjeta con avatar de iniciales, nombre, contacto y teléfono, categorías como etiquetas, último pedido, saldo coloreado ("Al día" cuando no debe) y las acciones "Nuevo pedido" y "Ver historial".

#### Scenario: Saldo con color
- **WHEN** un proveedor tiene saldo deudor
- **THEN** el sistema muestra el saldo en color de alerta; cuando está al día muestra "Al día" en color positivo

#### Scenario: Avatar de iniciales
- **WHEN** un proveedor tiene nombre
- **THEN** el sistema muestra su avatar con las iniciales de su nombre
