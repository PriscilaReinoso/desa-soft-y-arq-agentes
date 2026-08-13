# Presupuestos Specification

## Purpose

Lista los presupuestos y permite crear uno con encabezado, renglones editables y totales con IVA, en esta base con datos de ejemplo.

## Requirements

### Requirement: Listado de presupuestos
El sistema SHALL mostrar una tabla con número de presupuesto, cliente, fecha, vencimiento, artículos, total, estado como insignia y las acciones "Ver" y "PDF", más un botón "+ Nuevo presupuesto" que navega a la vista de creación.

#### Scenario: Navegación a creación
- **WHEN** el usuario hace clic en "+ Nuevo presupuesto"
- **THEN** el sistema muestra la vista de creación de presupuesto

#### Scenario: Vencimiento en alerta
- **WHEN** un presupuesto está vencido
- **THEN** el sistema muestra su fecha de vencimiento en color de alerta

### Requirement: Encabezado de creación
El sistema SHALL mostrar en la vista de creación un botón de volver y los campos Cliente, Lista de precios, Validez y Notas.

#### Scenario: Volver al listado
- **WHEN** el usuario hace clic en volver
- **THEN** el sistema regresa al listado de presupuestos

### Requirement: Renglones de presupuesto
El sistema SHALL mostrar los renglones del presupuesto en una tabla con código, artículo, cantidad editable, unidad, precio unitario y subtotal, con opción de eliminar renglón y un botón "+ Agregar artículo" de estilo punteado.

#### Scenario: Edición de cantidad
- **WHEN** el usuario modifica la cantidad de un renglón
- **THEN** el sistema refleja el valor ingresado en el campo correspondiente

#### Scenario: Eliminación de renglón
- **WHEN** el usuario hace clic en eliminar un renglón
- **THEN** el sistema quita el renglón del presupuesto

### Requirement: Totales con IVA
El sistema SHALL calcular y mostrar subtotal, IVA (21%) y el total, con el total destacado en tipografía monoespaciada.

#### Scenario: Cálculo de totales
- **WHEN** la vista de creación está abierta
- **THEN** el sistema muestra subtotal, IVA 21% y total calculados

### Requirement: Acciones de creación
El sistema SHALL ofrecer las acciones "Guardar borrador", "Exportar PDF" y "Cancelar".

#### Scenario: Cancelar la creación
- **WHEN** el usuario hace clic en Cancelar
- **THEN** el sistema vuelve al listado de presupuestos sin crear nada
