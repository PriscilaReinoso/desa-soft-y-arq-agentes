## Context

Ver `proposal.md - Why`. Estado actual relevante:

- Tailwind CSS v4 ya está instalado y activo (`@tailwindcss/vite` en `vite.config.ts`; `@import 'tailwindcss'` en `src/index.css`).
- Los tokens de color viven en `:root` como variables CSS y se mapean a utilitarios mediante `@theme inline` en `src/index.css` (background, foreground, card, primary, secondary, muted, accent, border, ring, radius).
- Los componentes usan estilos inline `style={{...}}`; existe un kit en `src/components/ui/` que ya encapsula varios patrones (Button, Card, Badge, DataTable, PageHeader, Field/Input/Select, etc.).
- No hay framework de test en el frontend: la verificación es `npm run build` (tsc + vite build) y revisión visual con `npm run dev`.

## Goals / Non-Goals

**Goals:**
- Que todos los estilos deriven de tokens centrales o de utilitarios Tailwind; eliminar literales de color, tipografía y dimensiones repetidos.
- Reducir duplicación de patrones de UI con primitivas reutilizables (Alert, PageContainer, FormError, pills vía Badge/FilterPills, unificación Input/SearchInput).
- Mantener el render visual idéntico al actual (refactor 1:1 de valores).

**Non-Goals:**
- No cambiar comportamiento, textos, datos ni estructura de componentes.
- No agregar dependencias nuevas (ni CSS-in-JS, ni MUI, ni styled-components).
- No refactorizar lógica de negocio ni servicios.

## Decisions

- **Tailwind v4 con valores arbitrarios para tamaños fuera de la escala por defecto.** El render actual usa valores específicos (fontSize 11/13/15/18/20/26, borderRadius 8/12/99, padding `'32px 36px'`, letterSpacing `0.06em`). Se usará la escala nativa donde coincida (`text-xs`=12px, `font-extrabold`=800, `rounded-lg`, `tracking-wider`, etc.) y valores arbitrarios (`text-[13px]`, `rounded-[8px]`, `tracking-[0.06em]`) donde no. *Alternativa:* redefinir la escala en `@theme`; se descarta por el riesgo de afectar otras páginas y por el costo de mantener una escala custom.
- **Tokens semánticos en `@theme` para colores hardcodeados.** Se agregan `--color-danger` (#C85A3A), `--color-success` (#7B9A4A) y `--font-sans`/`--font-mono` para habilitar `text-danger`, `bg-danger/10`, `font-mono`, `font-sans`. *Alternativa:* dejar los hex inline; se descarta porque es justamente lo que se busca centralizar.
- **Primitivas nuevas mínimas.** `PageContainer` centraliza el padding de página (`padding: 32px 36px` con `maxWidth` opcional para Dashboard/Presupuestos); `Alert` reemplaza las cajas de error `#C85A3A18`; `FormError` se integra a `Field` para el texto de error de formularios; `SearchInput` se reimplementa sobre `Input`. *Alternativa:* agregar el padding en `AppLayout.<main>`; se descarta porque Dashboard y Presupuestos requieren ancho máximo propio y páginas como el Asistente usan layout a altura completa.
- **Deduplicación de pills:** `ModeToggle` (InventoryPage) y las sugerencias del asistente se migran a `FilterPills`/patrón compartido; los tags inline de Depósitos y Proveedores se reemplazan por `Badge`.
- **Verificación por comparación visual + build.** `npm run build` valida types/compilación; revisión en `npm run dev` página por página para confirmar render equivalente.

## Risks / Trade-offs

- [Riesgo de desvío visual sutil en la migración (nuevas medidas, pesos, espaciados)] → Mapear 1:1 cada valor al utilitario equivalente; revisar cada página en `npm run dev` al finalizar.
- [Tailwind v4: los tokens de `@theme inline` referencian variables de `:root`, por lo que utilitarios como `bg-card`/`text-muted-foreground` ya funcionan; errores de nombres romperían el build visualmente] → Verificar que cada clase usada exista (build con Tailwind valida clases conocidas; las inexistentes simplemente no generan CSS, por eso la revisión visual es obligatoria).
- [Refactor amplio que toca ~20 archivos] → Orden por capas (tokens → primitivas → componentes → páginas), tareas pequeñas y build intermedio por etapa.
