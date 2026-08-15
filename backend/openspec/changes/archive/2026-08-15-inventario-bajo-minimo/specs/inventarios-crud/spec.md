## ADDED Requirements

### Requirement: Listar inventario con stock bajo el mínimo

El sistema SHALL exponer un endpoint que devuelva los ítems de inventario no
eliminados cuyo `stock` es menor que su `minimo_stock`, con paginación. Cada
ítem incluye los mismos campos y objetos relacionados que el listado: `id`,
`fila`, `columna`, `stock`, `minimo_stock`, `precio_venta`, `articulo` (con su
`categoria`), `medida`, `medida_venta` (puede ser `null`) y `espacio` (con su
`deposito`). Los ítems con `minimo_stock == 0` no se consideran bajo mínimo.

#### Scenario: Listado de ítems bajo el mínimo
- **WHEN** se solicita el listado de ítems bajo el mínimo y existen ítems no eliminados con `stock < minimo_stock`
- **THEN** el sistema responde HTTP 200 con una lista paginada de esos ítems con sus objetos relacionados

#### Scenario: Ítems con stock igual o mayor al mínimo quedan excluidos
- **WHEN** se solicita el listado y un ítem tiene `stock >= minimo_stock`
- **THEN** ese ítem no aparece en la respuesta

#### Scenario: Ítems con mínimo en cero quedan excluidos
- **WHEN** se solicita el listado y un ítem tiene `minimo_stock == 0`
- **THEN** ese ítem no aparece en la respuesta

#### Scenario: Ítems eliminados quedan excluidos
- **WHEN** se solicita el listado y existe un ítem eliminado con `stock < minimo_stock`
- **THEN** el ítem eliminado no aparece en la respuesta

#### Scenario: Sin ítems bajo el mínimo
- **WHEN** se solicita el listado y ningún ítem no eliminado tiene `stock < minimo_stock`
- **THEN** el sistema responde HTTP 200 con una lista vacía
