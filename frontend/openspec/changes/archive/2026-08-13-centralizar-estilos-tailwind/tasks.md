## 1. Tokens y primitivas

- [x] 1.1 Agregar tokens `--color-danger` (#C85A3A), `--color-success` (#7B9A4A), `--font-sans` (Nunito) y `--font-mono` (JetBrains Mono) al `@theme` de `src/index.css`
- [x] 1.2 Crear `PageContainer` (padding `32px 36px`, prop `maxWidth` opcional) y usarlo en las páginas que hoy repiten ese padding
- [x] 1.3 Crear `Alert` (caja de error `bg-danger/10` + `text-danger`) y reemplazar las cajas de error duplicadas
- [x] 1.4 Integrar `FormError` en `Field` (texto de error `text-[12px] text-danger`) y reemplazar los `<p>` de error de formularios
- [x] 1.5 Reimplementar `SearchInput` sobre `Input` (ancho y background propios) y eliminar duplicación de estilos base
- [x] 1.6 Deduplicar pills: migrar `ModeToggle` (InventoryPage) y sugerencias del asistente a `FilterPills`/patrón compartido

## 2. Componentes UI

- [x] 2.1 Migrar `Card`, `Button`, `Badge`, `DataTable`, `Field`, `Input`, `Select`, `ProgressBar`, `Avatar`, `EmptyState`, `PageHeader`, `FilterPills` y `KpiCard` a utilitarios Tailwind manteniendo el render
- [x] 2.2 Reemplazar los tags inline de Depósitos y Proveedores por `Badge`
- [x] 2.3 Migrar `Sidebar` y `AppLayout` a utilitarios Tailwind (incluye gradiente de marca si aplica)

## 3. Páginas

- [x] 3.1 Migrar `DashboardPage` (header, grid de KPIs, tabla de ventas recientes, cards con header, botón de gradiente)
- [x] 3.2 Migrar `InventoryPage` (header, form de alta, errores, ModeToggle, filtros, tabla)
- [x] 3.3 Migrar `DepositsPage` (grid de cards, tags → Badge)
- [x] 3.4 Migrar `SalesPage` (filtros y tabla)
- [x] 3.5 Migrar `SuppliersPage` (cards, tags → Badge)
- [x] 3.6 Migrar `PriceListsPage` (selector de listas, vista previa, header de card)
- [x] 3.7 Migrar `BudgetsPage` (listado y vista de creación: encabezado, renglones, totales)
- [x] 3.8 Migrar `AssistantPage` (header, sugerencias, burbujas de chat, input, animación)
- [x] 3.9 Migrar `LoginPage` (card, brand, errores)

## 4. Verificación

- [x] 4.1 Ejecutar `npm run build` (typecheck + build) sin errores
- [ ] 4.2 Revisar en `npm run dev` que todas las páginas rendericen idéntico al estado previo
