## 1. Configuración de la URL de la API

- [x] 1.1 Editar `src/services/http.ts` para que `API_BASE_URL` use `import.meta.env.VITE_API_BASE_URL` con fallback al valor actual `http://127.0.0.1:8000/api/v1`
- [x] 1.2 Verificar build local con `npm run build` (no rompe compilación)

## 2. Contenerización

- [x] 2.1 Crear `Dockerfile` multietapa (build con Node + servido con Nginx)
- [x] 2.2 Agregar configuración de Nginx para SPA fallback y control de caché
- [x] 2.3 Crear `.dockerignore` excluyendo `node_modules`, `dist`, `.env*` (salvo `.env.example`) y archivos de editor/SO

## 3. Variables de entorno y documentación

- [x] 3.1 Actualizar/crear `.env.example` documentando `VITE_API_BASE_URL` (y el prefijo `VITE_` de Vite)
- [x] 3.2 Documentar en el Dockerfile/usar `ARG ENV VITE_API_BASE_URL` para pasar la URL en build sin exponer secretos

## 4. Verificación

- [x] 4.1 Build de la imagen Docker del frontend
- [x] 4.2 Ejecutar el contenedor y verificar que la app se sirve y apunta a la API configurada
