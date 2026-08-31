## Purpose

Reproduce y ejecutar el backend de la API como una imagen de contenedor
reproducible, configurable íntegramente por variables de entorno y utilizable
junto a la base de datos en un compose, sin exponer credenciales.

## ADDED Requirements

### Requirement: Imagen reproducible del backend
El proyecto SHALL incluir un `Dockerfile` que permita construir una imagen
ejecutable del backend a partir de `requirements.txt`, de forma reproducible
y con las dependencias instaladas.

#### Scenario: Build de la imagen
- **WHEN** se construye la imagen a partir del `Dockerfile`
- **THEN** la imagen contiene el código de la aplicación y sus dependencias instaladas sin errores

#### Scenario: Build no incluye artefactos locales
- **WHEN** se construye la imagen
- **THEN** el contexto de build excluye `.env`, cachés de Python, entornos virtuales, `.git` y archivos temporales mediante `.dockerignore`

### Requirement: Configuración solo por variables de entorno
La configuración del backend dentro del contenedor SHALL provenir
exclusivamente de variables de entorno (base de datos, JWT, CORS), sin
contraseñas ni secretos hardcodeados en la imagen.

#### Scenario: Secretos no expuestos en la imagen
- **WHEN** se inspecciona la imagen construida
- **THEN** no contiene credenciales ni secretos en archivos ni en variables de entorno embebidas

#### Scenario: Configuración inyectada en tiempo de ejecución
- **WHEN** el contenedor se ejecuta provisto de variables de entorno (por ejemplo `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`)
- **THEN** la API las utiliza para conectarse y autenticarse sin necesidad de archivos locales

### Requirement: Ejecución de la API
El contenedor SHALL ejecutar la aplicación FastAPI con un servidor WSGI/ASGI (uvicorn) escuchando en el puerto HTTP definido.

#### Scenario: Arranque del servidor
- **WHEN** se inicia el contenedor
- **THEN** el servidor uvicorn levanta la aplicación `app.main:app` y queda escuchando en el puerto expuesto

#### Scenario: Health de la API
- **WHEN** el contenedor está corriendo y se consulta el endpoint raíz de la API
- **THEN** responde con HTTP 200

### Requirement: Utilizable en compose con la base de datos
La imagen SHALL poder utilizarse en un `docker-compose` que levante el backend junto a PostgreSQL, comunicándose por la red interna del compose y recibiendo la configuración de base de datos por variables de entorno.

#### Scenario: Orquestación con PostgreSQL
- **WHEN** se levanta el compose que define el backend y el servicio de PostgreSQL
- **THEN** el backend se conecta a PostgreSQL mediante las variables de entorno apuntadas al host del servicio de base de datos

#### Scenario: Sin credenciales en archivos versionados
- **WHEN** se inspecciona el compose y los archivos versionados
- **THEN** no contienen contraseñas reales en texto plano
