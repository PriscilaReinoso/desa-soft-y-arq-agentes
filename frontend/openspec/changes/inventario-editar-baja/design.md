## Context

`InventoryPage.tsx` ya carga inventario real (`useInventarios`) y renderiza la tabla con `DataTable`. `inventario.service.ts` ya expone `updateInventario` (PUT, campos `espacio_id`, `fila`, `columna`, `stock`, `precio_venta`) y `deleteInventario` (DELETE). El componente `Modal` se crea en `depositos-datos-api`; este change lo reutiliza (dependencia de componente compartido, no de backend). Ver proposal.md - Why para la motivación.

## Goals / Non-Goals

**Goals:**
- Agregar acciones por fila (editar, preventa placeholder, eliminar) con botones solo-ícono a la derecha.
- Editar los campos que soporta la API (espacio, fila, columna, stock, precio de venta) mediante modal.
- Eliminar con confirmación.

**Non-Goals:**
- No editar artículo ni medida (la API `PUT /inventarios/{id}` no los acepta).
- No implementar la funcionalidad de preventa (queda como placeholder deshabilitado).
- No tocar el backend.

## Decisions

- **Columna de acciones en `DataTable`**: se agrega una columna con `header: ''` al final del array `columns`, `align: 'right'`, con tres botones `ghost`/`sm` de íconos (glifos de la app): ✎ editar, 🛒 preventa, 🗑 eliminar. `DataTable` ya soporta render por columna sin cambios.
- **Modal de edición**: un solo formulario con `defaultValues` = el `InventarioRow` seleccionado; selectores de espacio (con nombre de depósito) y campos numéricos fila, columna, stock y precio de venta. Se muestra el artículo/medida como texto fijo no editable (respeta el alcance de la API).
- **Hooks nuevos en `useInventarios.ts`**: `useActualizarInventario` y `useEliminarInventario` como `useMutation` que invalidan `['inventarios']` en `onSuccess`. Se reusan los services existentes.
- **Confirmación de baja**: `window.confirm` (sin dependencias) preguntando por el artículo; se informa el resultado con `Alert` en caso de error.
- **Roles**: botones de editar/eliminar visibles solo para rol ADMIN (igual que el backend `require_roles("ADMIN")`); el botón de preventa se muestra a todos pero deshabilitado.
- **Selector de espacio en el modal**: usa `useEspacios` + `useDepositos` (ya existentes) para poblar el select y el nombre del depósito.

## Risks / Trade-offs

- [El modal de edición y el de depósitos comparten componente] → Se define `Modal` en `depositos-datos-api` y se reutiliza acá; si `depositos-datos-api` se implementa después, `Modal` queda pendiente en este change.
- [`window.confirm` limita la UX de confirmación] → Suficiente para esta iteración; un diálogo custom sería un refinamiento futuro.
- [Borrar un registro es irreversible en la API] → La confirmación explícita mitiga el borrado accidental.
