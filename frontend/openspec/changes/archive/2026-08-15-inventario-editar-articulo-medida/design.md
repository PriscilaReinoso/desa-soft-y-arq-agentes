## Context

El frontend consume la API vía `src/services/http.ts` (API_BASE_URL =
http://127.0.0.1:8000/api/v1). El modal de edición de inventario
(`src/pages/InventoryPage.tsx`) hoy solo edita espacio, ubicación, stock,
stock mínimo, precio de venta y medida de venta; no toca el artículo ni la
medida del ítem. El backend `PUT /inventarios/{id}` no acepta `medida_id` (la
medida queda fija al crear el ítem). Ver proposal.md - Why.

## Goals / Non-Goals

**Goals:**
- Poder editar desde el modal: artículo (nombre, descripción y categoría),
  medida del ítem y los campos ya editables.
- Selectores de medida buscables (combobox) en alta y edición.
- Soporte backend para cambiar `medida_id` de un ítem conservando la
  unicidad artículo + medida.

**Non-Goals:**
- No crear una página de maestros de medidas ni de artículos (decisión del
  usuario).
- No agregar eliminación física ni alta de medidas nuevas desde el modal de
  edición (el alta ya permite crear medida nueva).
- No tocar ventas, presupuestos, proveedores ni depósitos.

## Decisions

- **Backend: `medida_id` en `InventarioUpdate`**: se agrega `medida_id:
  uuid.UUID | None = None` al schema y, en `InventarioService.update`, si el
  campo viene en `model_fields_set` se valida que la medida exista (no
  eliminada) y que no exista otro ítem no eliminado con la misma combinación
  artículo + medida (`ConflictError` si aplica). `get_by_combinacion` devuelve
  el propio ítem si no cambió la medida, por lo que se excluye por `id`.
  - Alternativa considerada: crear un endpoint dedicado (`PUT
    /inventarios/{id}/medida`) — descartada: mantener un solo endpoint de
    update es más simple y consistente con el resto de los campos.
- **Frontend: combobox buscable reutilizable** (`src/components/ui/
  SearchableSelect.tsx`): input con desplegable, filtro por texto
  (coincidencia parcial en unidad o valor), opción de "Sin medida" cuando es
  opcional, cierre al seleccionar o al hacer clic fuera, y navegación por
  teclado básica. Se integra con React Hook Form vía `Controller` (los selects
  de medida del alta y del modal usan `Controller` con `name` existente:
  `medida_id`, `medida_venta_id`).
  - Alternativa considerada: `<select>` nativo con `size` grande — descartada:
  no permite buscar texto en el navegador.
- **Modal de edición ampliado**: se agregan los campos Artículo (nombre,
  descripción), Categoría (Select de `useCategorias`) y Medida (combobox
  buscable de `useMedidas`), precargados con los valores del ítem. Al guardar:
  1) si cambió nombre/descripción/categoría, `updateArticulo`; 2) `updateInventario`
  con `medida_id` (si cambió) y los campos editables restantes. Ambas
  mutations se ejecutan en secuencia; si alguna falla se muestra el error y no
  se cierra el modal. Después se invalidan `['inventarios']`,
  `['inventarios','bajo-minimo']` y `['articulos']`.
  - El alta mantiene los modos "Existente/Nueva" para la medida, pero el
    selector "Existente" y el de "Medida de venta" pasan a usar el combobox
    buscable.
- **Hooks**: se agrega `useActualizarArticulo` (mutation de `updateArticulo`)
  en `useArticulos.ts` y se reutiliza `useCategorias`.

## Risks / Trade-offs

- [Cambiar la medida del ítem puede romper la unicidad artículo + medida] →
  Se valida en el service y se responde `ConflictError` (409) con mensaje claro
  que el frontend muestra en el modal.
- [El cambio de medida con stock > 0 podría requerir revalidar la ubicación] →
  La validación de ubicación depende de espacio/fila/columna/stock, no de la
  medida; no cambia en este flujo.
- [Dos mutations encadenadas en el guardado del modal] → Costo aceptable; si la
  primera falla se aborta la segunda y el usuario corrige. El único caso parcial
  (artículo OK, ítem falla) es poco probable y visible por el mensaje de error.
- [Combobox accesible/teclado básico] → Se implementa navegación mínima; no se
  cubren casos complejos de accesibilidad (out of scope).
