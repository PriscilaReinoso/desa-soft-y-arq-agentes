# Navegación Specification

## Purpose

Proporciona el shell de la aplicación con la barra lateral de navegación agrupada y el enrutado entre las secciones del sistema.

## Requirements

### Requirement: Barra lateral de navegación
El sistema SHALL mostrar una barra lateral fija con el logo y marca FerreStock, ítems de navegación agrupados (Principal, Gestión, Ventas, Herramientas), el ítem activo destacado con el color primario, una insignia "IA" en el ítem del asistente y un pie de usuario con sus iniciales y rol.

#### Scenario: Ítem activo destacado
- **WHEN** el usuario se encuentra en una sección
- **THEN** el ítem de esa sección se muestra resaltado con el color primario y fondo claro

#### Scenario: Pie de usuario
- **WHEN** el usuario está autenticado
- **THEN** la barra lateral muestra sus iniciales, nombre y rol en el pie

### Requirement: Navegación por URL entre secciones
El sistema SHALL exponer cada sección con una URL propia (`/inicio`, `/inventario`, `/depositos`, `/ventas`, `/proveedores`, `/listas-de-precios`, `/presupuestos`, `/asistente`), redirigir la raíz a `/inicio` y actualizar el ítem activo al navegar.

#### Scenario: Navegación desde la barra lateral
- **WHEN** el usuario selecciona un ítem de la barra lateral
- **THEN** el sistema muestra la sección correspondiente y marca el ítem como activo

#### Scenario: Acceso directo por URL
- **WHEN** el usuario abre directamente la URL de una sección
- **THEN** el sistema muestra esa sección con el ítem activo correspondiente

### Requirement: Contenido independiente de la barra lateral
El sistema SHALL mantener la barra lateral fija en altura total y el área de contenido desplazable de forma independiente.

#### Scenario: Desplazamiento del contenido
- **WHEN** el contenido de una sección excede el alto de la ventana
- **THEN** el área de contenido se desplaza sin mover la barra lateral
