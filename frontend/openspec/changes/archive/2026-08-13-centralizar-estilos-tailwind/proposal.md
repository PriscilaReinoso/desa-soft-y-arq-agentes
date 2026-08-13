## Why

El frontend declara Tailwind CSS v4 como parte del stack y ya centraliza los tokens de color en `src/index.css` (variables CSS mapeadas a `@theme`), pero el código usa casi exclusivamente estilos inline `style={{...}}`. Esto genera duplicación de literales (padding de página `'32px 36px'`, look de panel, encabezado de tabla, caja de error `#C85A3A18`, error de campo, fuente mono, gradiente, pills y tags, colores semánticos hardcodeados) a lo largo de páginas y componentes, lo que dificulta el mantenimiento y permite que los estilos diverjan entre secciones.

## What Changes

- Migrar los estilos inline de páginas y componentes a utilitarios de Tailwind CSS v4, manteniendo el render visual idéntico al actual (refactor sin cambio de comportamiento).
- Extender los tokens centrales en `src/index.css` (`@theme`): agregar `--color-danger` (#C85A3A), `--color-success` (#7B9A4A) y mapear `--font-sans` (Nunito) y `--font-mono` (JetBrains Mono) para habilitar utilitarios `text-danger`, `bg-danger/10`, `font-sans` y `font-mono`.
- Crear primitivas reutilizables que eliminen duplicados: `Alert` (caja de error), `FormError` (integrado en `Field`), `PageContainer` (padding de página con `maxWidth` opcional), reutilización de `Badge` para pills/tags y unificación de `SearchInput` con `Input`.
- Deduplicar patrones repetidos: pills de filtro (FilterPills/ModeToggle/sugerencias del asistente), encabezado de tabla, header de card y caja de error.
- **BREAKING**: ninguno. Sin cambios de comportamiento ni de dependencias.

## Capabilities

### New Capabilities

- (ninguna: no se introduce comportamiento nuevo)

### Modified Capabilities

- (ninguna: refactor puro, no cambian requisitos; `skip_specs: true` en `.openspec.yaml`)

## Impact

- `src/index.css`: extensión de tokens en `@theme` (danger, success, fonts).
- `src/components/ui/`: migración de Card, DataTable, Button, Badge, Field, Input, Select, ProgressBar, Avatar, EmptyState, PageHeader, FilterPills, KpiCard; nuevas primitivas `Alert`, `PageContainer`, `FormError`; unificación `Input`/`SearchInput`.
- `src/pages/`: migración de Dashboard, Inventario, Depósitos, Ventas, Proveedores, Listas de precios, Presupuestos, Asistente IA y Login.
- `src/components/layout/`: migración de Sidebar y AppLayout.
- Sin dependencias nuevas. Verificación con `npm run build` (typecheck + build) y revisión visual en `npm run dev`.
