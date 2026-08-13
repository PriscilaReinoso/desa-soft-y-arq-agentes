# Listas de Precios Specification

## Purpose

Gestiona las listas de precios mostrando su multiplicador y una vista previa de los precios aplicados, en esta base con datos de ejemplo.

## Requirements

### Requirement: Encabezado y alta de lista
El sistema SHALL mostrar el título, una descripción breve y un botón "+ Nueva lista".

#### Scenario: Visualización del encabezado
- **WHEN** el usuario abre la sección de listas de precios
- **THEN** el sistema muestra el título, la descripción y el botón de alta

### Requirement: Selector de listas
El sistema SHALL mostrar las listas como tarjetas seleccionables con nombre, descripción, multiplicador, cantidad de artículos y una insignia "Inactiva" cuando corresponda. Seleccionar una lista la resalta y muestra su vista previa; seleccionarla nuevamente la deselecciona.

#### Scenario: Selección de una lista
- **WHEN** el usuario selecciona una lista
- **THEN** el sistema la resalta y muestra su vista previa

#### Scenario: Deselección de una lista
- **WHEN** el usuario selecciona nuevamente la lista activa
- **THEN** el sistema la deselecciona y oculta la vista previa

#### Scenario: Lista inactiva
- **WHEN** una lista está inactiva
- **THEN** el sistema muestra la insignia "Inactiva" en su tarjeta

### Requirement: Vista previa de la lista
El sistema SHALL mostrar, para la lista seleccionada, una tabla con Código, Artículo, Precio base y Precio de la lista (base por multiplicador) y los botones "Editar multiplicador" y "Exportar PDF".

#### Scenario: Precio aplicado
- **WHEN** hay una lista seleccionada
- **THEN** el sistema muestra el precio base y el precio resultante de aplicar el multiplicador

### Requirement: Estado vacío sin selección
El sistema SHALL mostrar un estado vacío con el mensaje "Seleccioná una lista para ver el detalle" cuando ninguna lista está seleccionada.

#### Scenario: Sin lista seleccionada
- **WHEN** el usuario abre la sección sin haber seleccionado ninguna lista
- **THEN** el sistema muestra el estado vacío con el mensaje correspondiente
