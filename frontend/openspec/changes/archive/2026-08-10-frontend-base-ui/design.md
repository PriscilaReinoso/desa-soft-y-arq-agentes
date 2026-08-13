## Context

El frontend no existe (ver proposal.md — Why). La referencia visual es el export de Figma en `frontend/docs/design/figma-src/`: React + TS + Vite + Tailwind CSS v4, design tokens definidos en `index.css`, 9 componentes de sección y un `App` con sidebar y navegación por estado. El backend (FastAPI) expone `/api/v1` con auth JWT y CRUDs; las páginas de esta base se renderizan con los datos de ejemplo del diseño y solo el login se conecta a la API real.

## Goals / Non-Goals

**Goals:**
- Base de frontend compilable (`tsc` + Vite build) que reproduce el diseño de Figma.
- Design tokens y componentes UI reutilizables desacoplados de las páginas.
- Capa de API y autenticación funcional preparada para conectar páginas en changes futuros.
- Navegación por URL con `react-router-dom`.
- Stack de datos y formularios con TanStack Query y React Hook Form.

**Non-Goals:**
- Conectar las páginas a los endpoints del backend (siguiente change).
- Módulos sin backend (ventas, proveedores, listas de precios, presupuestos, asistente IA) funcionales.
- Exportación PDF, charts, tests unitarios.

## Decisions

### 1. Scaffold Vite + React + TS en `frontend/` con Tailwind v4
El export de Figma ya usa Tailwind v4 (`@import 'tailwindcss'` + `@theme inline`). Se adopta la misma versión con el plugin `@tailwindcss/vite`, evitando el paso de PostCSS manual de Tailwind v3.
- Alternativa: Tailwind v3 — se descarta para no divergir del export.

### 2. Navegación con `react-router-dom` en lugar del switch por estado
El export usa `useState<Section>`. Se reemplaza por routing real (rutas `/inicio`, `/inventario`, etc.) con `createBrowserRouter`, `AppLayout` como layout route con `<Outlet/>` y `Sidebar` con `<NavLink>`.
- Alternativa: mantener el switch de Figma — más simple pero sin deep-linking y menos escalable.

### 3. Autenticación: `AuthContext` + guard de rutas
`AuthContext` persiste `access_token` y `usuario` (de `LoginResponse`) en `localStorage`. Un `ProtectedRoute` redirige a `/login` sin token; `/login` redirige a `/inicio` con sesión. El cliente HTTP (`services/http.ts`) agrega `Authorization: Bearer` y ante `401` cierra sesión.
- `LoginPage` es nueva (el diseño no la incluye) pero respeta el design system: card centrada, marca FerreStock, inputs y botón primary.
- Alternativa: diferir el login — descartada por decisión del usuario (2A).

### 4. Arquitectura por capas en `src/`
```
src/
├── main.tsx / App.tsx       # providers (QueryClient, Auth) + router
├── index.css                # design tokens (idéntico al export)
├── types/domain.ts          # tipos según schemas del backend (Articulo, Inventario, ...)
├── lib/format.ts            # moneda, fechas, margen
├── data/mock.ts             # datos de ejemplo extraídos del export
├── services/                # http.ts + auth + servicios por recurso (stubs)
├── hooks/                   # hooks de TanStack Query por recurso (useLogin, useArticulos, ...)
├── context/AuthContext.tsx
├── components/ui/           # primitivas: Button, Card, Badge, DataTable, Input, ...
├── components/layout/       # AppLayout, Sidebar
└── pages/                   # Login + 8 secciones
```
Separa presentación (páginas) de estructura (layout), primitivas de diseño (ui) y datos/acceso (data/services). `docs/design/figma-src/` queda como referencia sin modificar.

### 5. Portabilidad del diseño: primitivas con variantes
Se extraen las convenciones repetidas del export (botones primary/accent/outline/muted, badges por estado, header de página, tabla con header muted y celdas mono) a `components/ui/*`. Las páginas se reescriben usando esas primitivas preservando el marcado y espaciados originales (padding 32px/36px, radius 8/12, grid de columnas) para mantener el visual idéntico.
- Riesgo de desviación visual al refactorizar → las primitivas replican exactamente los estilos inline del export; verificación manual contra el original.

### 6. Login funcional; páginas con mock
`auth.service` consume `POST /api/v1/auth/login` real. Las páginas consumen `data/mock.ts` (mismos datos que el export) y los servicios de recursos quedan definidos pero sin uso activo.
- Base URL constante `http://127.0.0.1:8000/api/v1` en `services/http.ts`.

### 7. Datos del servidor con TanStack Query
`QueryClientProvider` se monta en `main.tsx`. Cada recurso expone hooks `useQuery`/`useMutation` (`src/hooks/`) que consumen los servicios; en esta base las páginas siguen usando el mock, pero el cliente de query queda operativo y el login usa `useMutation`.
- Alternativa: estado local con `useEffect` + fetch — descartada por decisión del usuario; TanStack Query aporta cache, retry y sincronización para los changes futuros de conexión.

### 8. Formularios con React Hook Form
Los formularios de la base (login, alta inline de inventario, renglones de presupuesto) se implementan con `react-hook-form` (registro + validación) y se renderizan con las primitivas del design system. En el login el submit dispara la `useMutation` de auth.
- Alternativa: estado local por campo — descartada por decisión del usuario.

## Risks / Trade-offs

- **Desviación visual respecto al diseño** → las primitivas copian los estilos del export y se valida pantalla por pantalla contra `figma-src`.
- **Login depende del backend corriendo** → si `POST /auth/login` no responde, se muestra error claro; el resto de la app no requiere backend en esta base.
- **Alcance del mock** → ventas/proveedores/listas/presupuestos/asistente son estáticos; podrían sugerir funcionalidad inexistente en backend. Se documenta como no-goal y se limita a lo representado en el diseño.
- **Token en `localStorage`** → no es la opción más segura frente a XSS, pero es la estándar para una SPA de este alcance; se mantiene el manejo por variables de entorno para secretos del backend.

## Migration Plan

- No aplica: creación inicial del frontend, sin datos preexistentes que migrar.
- Rollback: eliminar/restaurar `frontend/` (el export original se conserva en `docs/design/figma-src/`).

## Open Questions

- Ninguna que afecte specs o estructura de tareas. (La decisión de login/páginas mock y routing ya fue tomada con el usuario.)
