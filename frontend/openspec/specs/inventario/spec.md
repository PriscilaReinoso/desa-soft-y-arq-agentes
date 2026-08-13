# Inventario Specification

## Purpose

Gestiona el listado de artículos con búsqueda, filtros por categoría y alta inline, en esta base con datos de ejemplo.

## Requirements

### Requirement: Encabezado y alta de artículo
El sistema SHALL mostrar el título, la cantidad de artículos registrados y un botón "+ Nuevo artículo" que despliega un formulario inline con los campos Código, Nombre del artículo, Categoría, Stock actual, Stock mínimo, Unidad, Costo, Precio de venta y Depósito, con acciones Guardar y Cancelar.

#### Scenario: Despliegue del formulario
- **WHEN** el usuario hace clic en "+ Nuevo artículo"
- **THEN** el sistema muestra el formulario de alta inline con sus campos y botones Guardar y Cancelar

#### Scenario: Cancelar el alta
- **WHEN** el usuario hace clic en Cancelar
- **THEN** el sistema oculta el formulario sin crear ningún artículo

### Requirement: Búsqueda por nombre o código
El sistema SHALL permitir filtrar los artículos escribiendo en un campo de búsqueda que coincide con el nombre o el código.

#### Scenario: Búsqueda de artículos
- **WHEN** el usuario escribe un término en el campo de búsqueda
- **THEN** el sistema muestra únicamente los artículos cuyo nombre o código contienen el término

### Requirement: Filtros por categoría
El sistema SHALL mostrar filtros de categoría como píldoras seleccionables con estado activo, incluida la opción "Todos".

#### Scenario: Filtrar por categoría
- **WHEN** el usuario selecciona una píldora de categoría
- **THEN** el sistema muestra solo los artículos de esa categoría y resalta la píldora seleccionada

#### Scenario: Filtro combinado con búsqueda
- **WHEN** el usuario combina una categoría seleccionada con un término de búsqueda
- **THEN** el sistema muestra los artículos que cumplen ambas condiciones

### Requirement: Tabla de artículos
El sistema SHALL mostrar una tabla con las columnas Código, Artículo, Categoría, Stock, Mínimo, Depósito, Costo, Precio de venta, Margen y una acción Editar. Los artículos con stock menor al mínimo SHALL marcarse con la insignia "Bajo stock" y su stock en color de alerta; el margen SHALL mostrarse como insignia coloreada según umbral.

#### Scenario: Marcado de stock bajo
- **WHEN** un artículo tiene stock menor a su mínimo
- **THEN** el sistema muestra la insignia "Bajo stock" y el stock en color de alerta

#### Scenario: Margen como insignia
- **WHEN** un artículo tiene un margen calculado
- **THEN** el sistema lo muestra como insignia cuyo color depende del valor del margen
