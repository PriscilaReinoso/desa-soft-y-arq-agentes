## Context

La aplicación es un SPA de React + Vite + TypeScript compilada con `npm run build` (que ejecuta `tsc -b && vite build`) y servida actualmente solo en desarrollo. La URL de la API está hardcodeada en `src/services/http.ts` como `http://127.0.0.1:8000/api/v1`. No existe Dockerfile en el frontend. Es un frontend de Vite, por lo que las variables de entorno se inyectan en tiempo de build mediante `import.meta.env.*` (prefijo `VITE_`).

## Goals / Non-Goals

**Goals:**
- Entregar un `Dockerfile` multietapa de producción (build + servidor estático).
- Proveer `.dockerignore` para mantener el contexto de build limpio y sin secretos.
- Hacer configurable la URL base de la API vía `VITE_API_BASE_URL` (build-time), preservando el default actual.
- Documentar las variables de entorno necesarias en `.env.example`.
- Que la imagen final no contenga secretos.

**Non-Goals:**
- No crear el `docker-compose` final que levante backend + frontend (fuera del alcance de IF-27, se hará en un change posterior).
- No cambiar autenticación, lógica de negocio ni las rutas de la API.
- No implementar despliegue en un proveedor de cloud específico.

## Decisions

- **Servidor estático con Nginx**: se usa Nginx (imagen `nginx:alpine`) para servir los estáticos y hacer SPA fallback. Alternativa considerada: `serve` (Node) — descartada por menor rendimiento y mayor superficie de runtime.
- **Build con Node (multi-stage)**: etapa `build` con imagen `node:lts-alpine`, se copian `package*.json`, se instala con `npm ci`, se compila con `npm run build`; luego se copia `dist/` a la imagen Nginx. Esto reduce la imagen final y elimina dependencias de build del runtime.
- **SPA fallback**: la config de Nginx redirige las rutas no encontradas a `/index.html` para soportar rutas de `react-router`.
- **URL de API vía `VITE_API_BASE_URL`**: se cambia `src/services/http.ts` a `const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://127.0.0.1:8000/api/v1'`. Como Vite solo expone variables con prefijo `VITE_` al cliente, el valor se pasa como `ARG ENV VITE_API_BASE_URL`/`--build-arg`. No se exponen secretos porque el prefijo `VITE_` queda embebido solo como config pública de la app (no se usan claves de backend en el frontend).
- **`.dockerignore`**: se excluyen `node_modules`, `dist`, `.env*` salvo `.env.example`, y archivos de editor/SO.

## Risks / Trade-offs

- [Variables de entorno queman valores en el bundle en build-time] → Documentar en `.env.example`; para entornos distintos recompilar con el build-arg correspondiente.
- [Si se copiara un `.env` al contexto o imagen quedarían secretos] → `.dockerignore` excluye `.env*` y la imagen final solo copia `dist/`.
- [Nginx caché de index recién desplegado] → la config incluye control de caché razonable para assets con hash; el `index.html` se sirve sin cachear.
- [Puerto de la API dentro del compose] → el valor de `VITE_API_BASE_URL` apuntará al servicio del backend (nombre de servicio en la red del compose), definido en el future compose, no en este change.

## Migration Plan

1. Aplicar cambio en `src/services/http.ts` (usa `import.meta.env`).
2. Agregar `Dockerfile`, `.dockerignore` y actualizar `.env.example`.
3. Verificar build local (`npm run build`).
4. Build de imagen y prueba de ejecución local del contenedor.

## Open Questions

- Ninguna que afecte specs/approach. El armado del compose final (backend + frontend) queda como change posterior.
