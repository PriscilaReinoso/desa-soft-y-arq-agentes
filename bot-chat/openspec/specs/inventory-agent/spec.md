# inventory-agent Specification

## Purpose
Agente experto en el inventario y stock de la ferretería, gestionando consultas operativas sobre mercadería.

## Requirements

### Requirement: Consulta de Stock
El agente MUST poder responder a consultas sobre la cantidad disponible de un producto específico.

#### Scenario: Consulta de disponibilidad
- **WHEN** un usuario consulta si hay stock de un producto
- **THEN** el agente informa la cantidad actual disponible

### Requirement: Registro de Movimientos
El agente MUST estar capacitado para interpretar consultas sobre ingresos y egresos de mercadería.

#### Scenario: Consulta de ingresos
- **WHEN** un usuario consulta por ingresos recientes de mercadería
- **THEN** el agente proporciona los detalles correspondientes de los ingresos
