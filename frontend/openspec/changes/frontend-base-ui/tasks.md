## 1. Scaffold y configuración del proyecto

- [x] 1.1 Scaffold de Vite + React + TypeScript en `frontend/` (npm create vite, plantilla react-ts)
- [x] 1.2 Instalar dependencias: `react-router-dom`, `@tanstack/react-query`, `react-hook-form`; dev: `tailwindcss`, `@tailwindcss/vite`, `@types/react`, `@types/react-dom`
- [x] 1.3 Configurar `vite.config.ts` con `@vitejs/plugin-react` y el plugin `@tailwindcss/vite`
- [x] 1.4 Crear `index.html` (root + título FerreStock)
- [x] 1.5 Crear `src/index.css` con los design tokens idénticos al export (`frontend/docs/design/figma-src/src/index.css`) y las fuentes Nunito + JetBrains Mono
- [x] 1.6 Crear `src/main.tsx` montando la app con los providers (QueryClient + Auth) y `src/App.tsx` con el router

## 2. Tipos, datos de ejemplo y utilidades

- [x] 2.1 Crear `src/types/domain.ts` con los tipos del dominio según schemas del backend (Usuario, Articulo, Categoria, Medida, Deposito, Espacio, Inventario, LoginRequest/LoginResponse) y tipos de las secciones mock (Venta, Proveedor, ListaPrecios, Presupuesto, Renglon, Producto)
- [x] 2.2 Crear `src/data/mock.ts` con los datos de ejemplo extraídos del export (kpis, ventas recientes, productos, depósitos, proveedores, listas, presupuestos, renglones, sugerencias del asistente)
- [x] 2.3 Crear `src/lib/format.ts` con utilidades de formato (moneda, fechas, cálculo de margen)

## 3. Primitivas del design system

- [x] 3.1 Crear `src/components/ui/Button.tsx` con variantes primary, accent, outline, muted y ghost
- [x] 3.2 Crear `src/components/ui/Card.tsx` y `src/components/ui/Badge.tsx` con variantes de color por estado
- [x] 3.3 Crear `src/components/ui/DataTable.tsx` con header muted uppercase y soporte de celdas monoespaciadas
- [x] 3.4 Crear `src/components/ui/PageHeader.tsx` (título + subtítulo + slot de acción)
- [x] 3.5 Crear `src/components/ui/Field.tsx`, `Input.tsx` y `Select.tsx` (label + control según diseño)
- [x] 3.6 Crear `src/components/ui/SearchInput.tsx` y `src/components/ui/FilterPills.tsx` (píldoras con estado activo)
- [x] 3.7 Crear `src/components/ui/ProgressBar.tsx`, `Avatar.tsx` y `EmptyState.tsx`
- [x] 3.8 Crear `src/components/KpiCard.tsx` (icono + valor monoespaciado + etiqueta + variación + círculo decorativo)

## 4. Layout y navegación

- [x] 4.1 Crear `src/components/layout/AppLayout.tsx` con sidebar fija y `<Outlet/>` para el contenido scrollable
- [x] 4.2 Crear `src/components/layout/Sidebar.tsx` con logo FerreStock, grupos (Principal/Gestión/Ventas/Herramientas), ítems con `<NavLink>`, item activo en primary, insignia "IA" y footer de usuario con iniciales y rol
- [x] 4.3 Definir las rutas en `App.tsx`: `/login`, `/inicio`, `/inventario`, `/depositos`, `/ventas`, `/proveedores`, `/listas-de-precios`, `/presupuestos`, `/asistente`, y redirect de `/` a `/inicio`

## 5. Autenticación

- [x] 5.1 Crear `src/services/http.ts` con el cliente fetch que agrega `Authorization: Bearer`, base URL `http://127.0.0.1:8000/api/v1` y manejo de errores/401
- [x] 5.2 Crear `src/services/auth.service.ts` con `login()` contra `POST /auth/login`
- [x] 5.3 Crear `src/context/AuthContext.tsx` que persiste `access_token` y `usuario` en localStorage y expone login/logout
- [x] 5.4 Crear `src/components/layout/ProtectedRoute.tsx` que redirige a `/login` sin sesión y a `/inicio` si el usuario autenticado visita `/login`
- [x] 5.5 Crear `src/pages/LoginPage.tsx` con el design system (card centrada, marca, campos usuario/contraseña con `react-hook-form`, mensajes de error, submit vía `useMutation` de auth)

## 6. Páginas de sección (visual idéntico al diseño)

- [x] 6.1 Crear `src/pages/DashboardPage.tsx` (KPIs, ventas recientes, stock bajo mínimo, acceso al asistente)
- [x] 6.2 Crear `src/pages/InventoryPage.tsx` (búsqueda, filtros por categoría, formulario de alta inline con `react-hook-form`, tabla con margen y "Bajo stock")
- [x] 6.3 Crear `src/pages/DepositsPage.tsx` (grid de tarjetas con barra de ocupación)
- [x] 6.4 Crear `src/pages/SalesPage.tsx` (filtro por estado, total filtrado, tabla con acciones Ver/PDF)
- [x] 6.5 Crear `src/pages/SuppliersPage.tsx` (búsqueda y tarjetas con avatar, saldo y acciones)
- [x] 6.6 Crear `src/pages/PriceListsPage.tsx` (selector de listas, vista previa y estado vacío)
- [x] 6.7 Crear `src/pages/BudgetsPage.tsx` (listado + vista de creación con renglones editables y totales con IVA, formulario con `react-hook-form`)
- [x] 6.8 Crear `src/pages/AssistantPage.tsx` (chat con sugerencias, mensajes diferenciados, indicador de escritura)

## 7. Servicios stub, hooks de query y verificación

- [x] 7.1 Crear servicios stub en `src/services/` para articulos, categorias, medidas, depositos, espacios e inventario (sin conexión activa)
- [x] 7.2 Crear hooks de TanStack Query en `src/hooks/` (useLogin con `useMutation` y hooks `useQuery` por recurso)
- [x] 7.3 Ejecutar `npm run build` (tsc + Vite) y corregir errores hasta que compile sin warnings de tipos
- [x] 7.4 Revisar cada página contra `frontend/docs/design/figma-src/` para confirmar que el visual y los estados coinciden con el diseño
