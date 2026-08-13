## Purpose

Permite dar de alta un ítem de inventario en una única operación transaccional
creando o reutilizando el artículo, la medida y el espacio involucrados. Si
cualquier componente no puede darse de alta, la operación se revierte por
completo.

## ADDED Requirements

### Requirement: Alta compuesta de inventario

El sistema SHALL exponer un endpoint de alta que reciba un artículo, una
medida y, opcionalmente, un espacio junto con `stock`, `precio_venta`, `fila`
y `columna`. Cada componente puede enviarse:

- Existente, mediante su `id`.
- Nuevo, sin `id`, con los datos para darlo de alta.

Reglas:

- La combinación de artículo + medida debe ser única.
- Si no se envían `stock` ni espacio, el ítem se crea con `espacio_id = null`
  y `stock = 0`; `precio_venta` debe ser `>= 0`.
- Si se envía un espacio sin `id`, se da de alta antes del inventario.
- Si no se puede dar de alta el artículo, la medida o el espacio, el sistema
  NO crea el inventario y revierte todo lo insertado (rollback).

#### Scenario: Alta con artículo, medida y espacio nuevos
- **WHEN** se envían un artículo nuevo, una medida nueva y un espacio nuevo sin `id`
- **THEN** el sistema da de alta artículo, medida y espacio, crea el inventario y responde HTTP 201

#### Scenario: Alta con artículo, medida y espacio existentes
- **WHEN** se envían un artículo, una medida y un espacio con `id` válidos
- **THEN** el sistema reutiliza las entidades existentes, crea el inventario y responde HTTP 201

#### Scenario: Alta sin stock y sin espacio
- **WHEN** se envían un artículo y una medida y no se envían `stock`, espacio ni ubicación
- **THEN** el sistema crea el inventario con `stock = 0`, `espacio_id = null` y responde HTTP 201

#### Scenario: Alta con espacio nuevo y stock
- **WHEN** se envían un artículo, una medida, un espacio nuevo y un `stock` mayor que 0
- **THEN** el sistema da de alta el espacio, crea el inventario con el stock y responde HTTP 201

#### Scenario: Combinación artículo y medida duplicada
- **WHEN** la combinación de artículo + medida ya existe en inventario
- **THEN** el sistema rechaza la operación con HTTP 409 y no inserta nada

#### Scenario: Fallo al dar de alta el artículo
- **WHEN** el artículo nuevo no puede darse de alta (por ejemplo, nombre duplicado)
- **THEN** el sistema rechaza la operación y revierte todo lo insertado

#### Scenario: Fallo al dar de alta la medida
- **WHEN** la medida nueva no puede darse de alta (por ejemplo, combinación duplicada)
- **THEN** el sistema rechaza la operación y revierte todo lo insertado

#### Scenario: Fallo al dar de alta el espacio
- **WHEN** el espacio nuevo no puede darse de alta (por ejemplo, depósito inexistente)
- **THEN** el sistema rechaza la operación y revierte todo lo insertado

#### Scenario: Precio negativo
- **WHEN** se envía un `precio_venta` menor que 0
- **THEN** el sistema rechaza la solicitud con HTTP 422 y no inserta nada
