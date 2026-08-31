## Purpose

Permite contenerizar el frontend para su despliegue en producción mediante una imagen Docker que sirve los estáticos compilados, configurable por variables de entorno, sin exponer secretos.

## ADDED Requirements

### Requirement: Build de producción contenerizado
El proyecto SHALL incluir un Dockerfile que compile la aplicación (script `build`) y sirva los estáticos resultantes con un servidor web optimizado para producción.

#### Scenario: Imagen de producción generada
- **WHEN** se ejecuta el build de la imagen Docker del frontend
- **THEN** el resultado es una imagen lista para servir la aplicación compilada

#### Scenario: Exclusiones del contexto de build
- **WHEN** se construye la imagen Docker
- **THEN** el contexto de build excluye `node_modules`, `dist`, `.env` y otros archivos innecesarios o sensibles mediante un `.dockerignore`

### Requirement: Configuración por variables de entorno
La URL base de la API del frontend SHALL ser configurable mediante una variable de entorno en tiempo de build (`VITE_API_BASE_URL`), manteniendo como valor por defecto `http://127.0.0.1:8000/api/v1` cuando no se provea.

#### Scenario: URL de API configurada en el build
- **WHEN** se le provee `VITE_API_BASE_URL` al build y la aplicación realiza peticiones
- **THEN** las peticiones se dirigen a la URL provista en lugar del valor por defecto

#### Scenario: Valor por defecto sin configuración
- **WHEN** no se provee `VITE_API_BASE_URL` al build
- **THEN** la aplicación usa la URL base por defecto `http://127.0.0.1:8000/api/v1`

### Requirement: Sin exposición de secretos
La imagen de producción SHALL NO contener contraseñas, claves ni tokens en la capa final; los valores sensibles SHALL inyectarse únicamente mediante variables de entorno del build o del runtime, no hardcodearse ni copiarse a la imagen.

#### Scenario: La imagen final no incluye secretos
- **WHEN** se inspecciona la imagen final de producción
- **THEN** no contiene archivos `.env` ni valores secretos copiados en su sistema de archivos
