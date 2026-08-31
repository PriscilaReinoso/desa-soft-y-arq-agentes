## Why

El frontend (React + Vite) actualmente solo se ejecuta en desarrollo local contra una URL de API hardcodeada (`http://127.0.0.1:8000`). Para poder desplegar la aplicación y levantarla junto al backend mediante una orquestación (compose), es necesario contenerizarla con un Dockerfile que genere la imagen de producción, sin exponer contraseñas ni secretos, y leyendo la configuración únicamente desde variables de entorno.

## What Changes

- Agregar un `Dockerfile` de producción (multietapa: build con Node y servido con Nginx).
- Agregar un `.dockerignore` para excluir `node_modules`, `dist`, `.env`, etc., del contexto de build.
- Hacer configurable la URL base de la API (`VITE_API_BASE_URL`) vía variable de entorno en tiempo de build, manteniendo el valor actual (`http://127.0.0.1:8000/api/v1`) como default.
- Agregar/ajustar `.env.example` documentando las variables necesarias para el build.
- No exponer ningún secreto en la imagen final: los valores sensibles se inyectan solo por variables de entorno del build (build args) o del runtime de Nginx.

## Capabilities

### New Capabilities
- `contenedores`: Contenerización del frontend para producción, incluyendo el Dockerfile, el .dockerignore y la configuración de la URL de la API mediante variables de entorno, de forma que la imagen no contenga secretos y pueda usarse en un compose junto al backend.

### Modified Capabilities
<!-- Ninguna: no se modifica el comportamiento de capabilities existentes más allá de cómo se configura la URL de la API (nueva capability). -->

## Impact

- **Código**: `src/services/http.ts` (uso de `import.meta.env.VITE_API_BASE_URL` con fallback).
- **Archivos nuevos**: `Dockerfile`, `.dockerignore`, ajustes a `.env.example`.
- **Dependencias**: la imagen de build usa Node para compilar; la imagen final usa Nginx para servir estáticos.
- **Sistemas**: construcción de imagen Docker; posteriormente se usará en un compose final junto al backend (fuera del alcance de este change).
- **Sin cambios de API ni de la lógica de negocio del frontend.**
