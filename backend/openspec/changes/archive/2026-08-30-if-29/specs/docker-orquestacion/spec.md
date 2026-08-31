## Purpose

Orquesta todo el stack del sistema (frontend, backend, bot-chat y la base de
datos compartida) mediante un único `docker-compose` a nivel raíz, sin exponer
credenciales y con persistencia en volúmenes.

## ADDED Requirements

### Requirement: Orquestación del stack completo
El compose raíz SHALL levantar los servicios `frontend`, `backend`, `bot-chat`
y la base de datos compartida, construyendo cada uno desde su Dockerfile
correspondiente.

#### Scenario: Levantar el stack completo
- **WHEN** se ejecuta el `docker-compose up` a nivel raíz
- **THEN** se construyen y levantan los contenedores de frontend, backend, bot-chat y la base de datos

#### Scenario: Build desde cada Dockerfile
- **WHEN** se construye el stack
- **THEN** `frontend`, `backend` y `bot-chat` se construyen desde sus `Dockerfile`; backend/frontend con `build.context` propio y bot-chat con contexto `./bot-chat` + contexto adicional `mcp-server` (copia `bot-chat/` y `mcp-server/`)

### Requirement: Base de datos compartida levantada primero
El compose SHALL levantar la base de datos (servicio `db`) antes que los
servicios que dependen de ella, de modo que backend y bot-chat la compartan.

#### Scenario: La BD se inicia antes que los servicios dependientes
- **WHEN** se levanta el stack
- **THEN** el servicio de base de datos alcanza el estado healthy antes de iniciar backend y bot-chat

#### Scenario: Backend y bot-chat comparten la misma base de datos
- **WHEN** se configuran las variables de conexión de backend y bot-chat
- **THEN** ambas apuntan a la misma base de datos compartida

#### Scenario: Acceso a la BD desde el host
- **WHEN** se consulta la base de datos desde el host (p. ej. DBeaver)
- **THEN** se puede conectar a `localhost:5433` con las credenciales de la base de datos

### Requirement: Sin credenciales expuestas
El compose SHALL no exponer contraseñas en texto plano; las credenciales de la
base de datos SHALL provenir de valores predefinidos/default o de variables
de entorno no versionadas.

#### Scenario: Credenciales no hardcodeadas
- **WHEN** se inspecciona el `docker-compose.yml` versionado
- **THEN** no contiene contraseñas reales en texto plano, sólo valores predefinidos/default o referencias a variables de entorno

### Requirement: Persistencia de la base de datos
Los datos de la base de datos compartida SHALL persistir en un volumen de
Docker, de modo que sobrevivan al ciclo de vida del contenedor.

#### Scenario: La BD persiste entre reinicios
- **WHEN** se recrea el contenedor de la base de datos
- **THEN** los datos se conservan en el volumen de la base de datos

### Requirement: Persistencia de las conversaciones de bot-chat
Las conversaciones del bot-chat SHALL persistir en un volumen de Docker.

#### Scenario: Las conversaciones persisten entre reinicios
- **WHEN** se recrea el contenedor de bot-chat
- **THEN** las conversaciones guardadas se conservan en el volumen de conversaciones

### Requirement: Inicialización de la base de datos con datos de inicio
El compose SHALL incluir un `init.sql` ubicado a la misma altura que el
compose y montarlo en el mecanismo de inicialización de la base de datos, de
modo que al primer arranque se inserten valores de inicio en la base
compartida.

#### Scenario: El init.sql se ejecuta al primer arranque
- **WHEN** se levanta el stack por primera vez con un volumen de base de datos vacío
- **THEN** se ejecuta el `init.sql` y se insertan los valores de inicio definidos en la base compartida

#### Scenario: El init.sql está junto al compose
- **WHEN** se inspecciona la raíz del proyecto
- **THEN** existe un `init.sql` a la misma altura que el `docker-compose.yml`
