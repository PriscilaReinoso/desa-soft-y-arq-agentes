## Why

El frontend del sistema de gestión de inventario (FerreStock) no existe aún: la carpeta `frontend/` solo contiene config de OpenSpec y la referencia de diseño (`docs/design/figma-src/`, exportada desde Figma). Se necesita la base inicial del frontend que materialice ese diseño UX/UI como aplicación React, con la arquitectura y componentes reutilizables listos para las próximas iteraciones.

## What Changes

- Scaffold del frontend en `frontend/` con Vite + React + TypeScript + Tailwind CSS v4 + react-router-dom, TanStack Query (cache/sincronización de datos) y React Hook Form (formularios).
- Design system (design tokens: colores, tipografía Nunito + JetBrains Mono, radios, sombras) idéntico al export de Figma.
- Shell de aplicación: sidebar de navegación con grupos e item activo, layout de contenido, rutas por sección.
- Pantalla de **login** (no presente en el diseño, pero requerida por el backend JWT) construida con el mismo design system; almacena el token y protege las rutas.
- Capa de API preparada (cliente HTTP con `Authorization: Bearer`, servicios para auth/artículos/categorías/medidas/depósitos/espacios/inventario) sin conectar aún las páginas.
- 8 secciones renderizadas con datos de ejemplo extraídos del export (visual idéntico al diseño): Dashboard, Inventario, Depósitos, Ventas, Proveedores, Listas de precios, Presupuestos y Asistente IA.
- Componentes UI reutilizables (Button, Card, Badge, DataTable, PageHeader, SearchInput, FilterPills, Field/Input/Select, ProgressBar, KpiCard, Avatar, EmptyState).
- Verificación con `npm run build` (typecheck + build).

Fuera de alcance (cambios futuros): conexión real de las páginas a la API, módulos sin backend (ventas, proveedores, listas de precios, presupuestos, asistente IA), exportación PDF.

## Capabilities

### New Capabilities

- `autenticacion`: login con JWT contra `/api/v1/auth/login`, persistencia del token y del usuario, logout, y protección de rutas.
- `navegacion`: shell con sidebar agrupada, item activo, footer de usuario y routing entre secciones.
- `dashboard`: página de inicio con KPIs, ventas recientes, alertas de stock bajo y acceso al asistente.
- `inventario`: listado de artículos con búsqueda, filtros por categoría, tabla con márgenes/badges y formulario de alta inline.
- `depositos`: grid de tarjetas de depósitos con barra de ocupación y acciones.
- `ventas`: listado de ventas con filtro por estado, total filtrado y acciones por fila.
- `proveedores`: listado de proveedores con búsqueda, tarjetas con contacto/saldo/estrellas y acciones.
- `listas-precios`: selector de listas de precios, vista previa con precios aplicados y estado vacío.
- `presupuestos`: listado de presupuestos y vista de creación con encabezado, renglones editables y totales con IVA.
- `asistente-ia`: chat con sugerencias rápidas, mensajes usuario/asistente, indicador de escritura y respuestas simuladas.

### Modified Capabilities

- (ninguna: no existen specs previas en `openspec/specs/`)

## Impact

- `frontend/`: creación completa del proyecto (package.json, vite.config.ts, index.html, src/**).
- Dependencias nuevas: `react`, `react-dom`, `react-router-dom`, `@tanstack/react-query`, `react-hook-form`; dev: `typescript`, `vite`, `@vitejs/plugin-react`, `tailwindcss`, `@tailwindcss/vite`, `@types/react`, `@types/react-dom`.
- `frontend/docs/design/figma-src/`: se conserva como referencia (no se modifica).
- Backend: sin cambios. Consumo previsto de `http://127.0.0.1:8000/api/v1` (login funcional).
