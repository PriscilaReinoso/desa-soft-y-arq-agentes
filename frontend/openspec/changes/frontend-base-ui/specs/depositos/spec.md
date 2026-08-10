## Purpose

Muestra los depósitos de la organización con su ocupación y datos clave dispuestos en tarjetas, en esta base con datos de ejemplo.

## ADDED Requirements

### Requirement: Encabezado y alta de depósito
El sistema SHALL mostrar el título, la cantidad de depósitos activos y un botón "+ Nuevo depósito".

#### Scenario: Visualización del encabezado
- **WHEN** el usuario abre la sección de depósitos
- **THEN** el sistema muestra el título, la cantidad de depósitos y el botón de alta

### Requirement: Tarjetas de depósito
El sistema SHALL mostrar los depósitos en una grilla de dos columnas, cada uno con nombre, ubicación, porcentaje de ocupación como insignia, barra de ocupación coloreada según umbral, cantidad de artículos en tipografía monoespaciada, responsable, categorías como etiquetas y las acciones "Ver artículos" y "Editar".

#### Scenario: Ocupación con umbral
- **WHEN** la ocupación de un depósito supera el umbral definido
- **THEN** el sistema colorea su insignia y barra de ocupación en color de alerta

#### Scenario: Etiquetas de categorías
- **WHEN** un depósito tiene categorías asociadas
- **THEN** el sistema las muestra como etiquetas en la tarjeta
