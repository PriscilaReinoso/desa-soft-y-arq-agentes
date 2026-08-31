# project-structure Specification

## Purpose
Define la organización de directorios del repositorio del MCP Server para que
el código fuente, la configuración y las tools de inventario sigan el formato
de carpetas declarado en `AGENTS.md`, facilitando su mantenimiento y
navegación.
## Requirements
### Requirement: Estructura de directorios acorde a AGENTS.md
El proyecto MUST organizar el código del MCP Server en las carpetas
`app/server.py` (punto de entrada), `app/core/` (configuración y conexión a
PostgreSQL), `app/tools/` (herramientas MCP) y `app/services/` (lógica de
negocio reutilizable), respetando una única responsabilidad por archivo y
nombres en `snake_case`.

#### Scenario: El código vive en la estructura declarada
- **WHEN** se inspecciona el repositorio
- **THEN** el servidor MCP está en `app/server.py`, la configuración y la
  conexión a base en `app/core/`, las tools en `app/tools/` y la lógica
  reutilizable en `app/services/`.

### Requirement: Configuración y conexión centralizadas
El acceso a PostgreSQL MUST estar centralizado en la capa `app/core` (por
ejemplo `app/core/config.py` y `app/core/database.py`), de modo que ninguna
tool construya conexiones ni lea variables de entorno por sí misma.

#### Scenario: Las tools usan la capa core para acceder a la base
- **WHEN** una tool necesita consultar la base de datos
- **THEN** utiliza los componentes de conexión de `app/core` y no construye
  su propia conexión.

### Requirement: Documentación de rutas actualizada
La documentación del proyecto (README y referencias de rutas en `AGENTS.md`)
MUST reflejar la estructura de carpetas final del repositorio.

#### Scenario: La documentación coincide con el código
- **WHEN** se consulta la documentación de estructura del proyecto
- **THEN** las rutas documentadas corresponden a las carpetas reales del
  repositorio.

