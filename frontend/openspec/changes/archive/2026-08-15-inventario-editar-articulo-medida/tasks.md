## 1. Backend: cambio de medida del ítem

- [x] 1.1 Agregar `medida_id: uuid.UUID | None = None` a `InventarioUpdate` en `backend/app/schemas/inventario.py`
- [x] 1.2 En `backend/app/services/inventario_service.py`, `update`: si `medida_id` viene en `model_fields_set`, validar que la medida exista (no eliminada) y que no exista otro ítem no eliminado con la misma combinación artículo + medida (`ConflictError`), y aplicarlo al ítem
- [x] 1.3 Agregar tests en `backend/tests/test_inventario.py` para el cambio de medida (éxito, medida inexistente y conflicto de unicidad) y ejecutar `python -m pytest tests -q`

## 2. Frontend: servicios, hooks y combobox

- [x] 2.1 Ampliar el tipo de `updateInventario` en `src/services/inventario.service.ts` y en `useActualizarInventario` (`src/hooks/useInventarios.ts`) para aceptar `medida_id?: string`
- [x] 2.2 Agregar en `src/hooks/useArticulos.ts` la mutation `useActualizarArticulo` (usa `updateArticulo`) que invalide `['articulos']` e `['inventarios']`
- [x] 2.3 Crear `src/components/ui/SearchableSelect.tsx`: combobox con input de búsqueda, desplegable filtrado por texto, opción "Sin medida" cuando es opcional, cierre al seleccionar o al hacer clic fuera

## 3. Frontend: alta de inventario

- [x] 3.1 En `src/pages/InventoryPage.tsx`, reemplazar el select "Medida" (modo existente) por `SearchableSelect` alimentado por `useMedidas` (integración con React Hook Form vía `Controller`)
- [x] 3.2 Reemplazar el select "Medida de venta" del alta por `SearchableSelect` (opcional, sin medida por defecto)

## 4. Frontend: modal de edición

- [x] 4.1 Agregar al modal de edición los campos Artículo (nombre, descripción) y Categoría (Select de `useCategorias`), precargados con el artículo del ítem
- [x] 4.2 Agregar al modal el campo Medida (`SearchableSelect` de `useMedidas`), precargado con la medida actual del ítem
- [x] 4.3 En el guardado del modal, ejecutar `updateArticulo` si cambió el artículo y luego `updateInventario` (con `medida_id`, `medida_venta_id` y el resto de los campos); en caso de error mostrar el mensaje y no cerrar el modal; al éxito invalidar `['inventarios']`, `['inventarios','bajo-minimo']` y `['articulos']`

## 5. Verificación

- [x] 5.1 Ejecutar `python -m pytest tests -q` en el backend sin errores
- [x] 5.2 Ejecutar `npm run build` sin errores de TypeScript
- [ ] 5.3 Revisar visualmente en `npm run dev` contra el backend (modal de edición con artículo, categoría y medida; selects buscables en alta y edición)
