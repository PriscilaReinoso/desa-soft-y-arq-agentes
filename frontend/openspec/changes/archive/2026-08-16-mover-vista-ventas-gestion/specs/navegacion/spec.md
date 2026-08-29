## MODIFIED Requirements

### Requirement: Barra lateral de navegación
El sistema SHALL mostrar una barra lateral fija con el logo y marca FerreStock, ítems de navegación agrupados (Principal, Gestión, Ventas, Herramientas), con el ítem "Ventas" agrupado bajo la categoría "Ventas" junto con "Presupuestos", el ítem activo destacado con el color primario, una insignia "IA" en el ítem del asistente y un pie de usuario con sus iniciales y rol.

#### Scenario: Ítem activo destacado
- **WHEN** el usuario se encuentra en una sección
- **THEN** el ítem de esa sección se muestra resaltado con el color primario y fondo claro

#### Scenario: Agrupación del ítem Ventas
- **WHEN** el usuario visualiza la barra lateral
- **THEN** el ítem "Ventas" se muestra dentro del grupo "Ventas", junto al ítem "Presupuestos", y no en el grupo "Gestión"

#### Scenario: Pie de usuario
- **WHEN** el usuario está autenticado
- **THEN** la barra lateral muestra sus iniciales, nombre y rol en el pie
