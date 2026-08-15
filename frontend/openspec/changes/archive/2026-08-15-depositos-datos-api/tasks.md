## 1. Componente Modal

- [x] 1.1 Crear `src/components/ui/Modal.tsx`: overlay fijo, panel centrado, botón ✕, cierre por clic fuera y Escape, prop `open`, `onClose`, `title` y `children`

## 2. Hooks de depósitos

- [x] 2.1 Agregar en `src/hooks/useDepositos.ts` el hook `useCrearDeposito` (useMutation → `createDeposito`, invalida `['depositos']`)
- [x] 2.2 Agregar en `src/hooks/useDepositos.ts` el hook `useActualizarDeposito` (useMutation → `updateDeposito`, invalida `['depositos']`)

## 3. Página de depósitos

- [x] 3.1 Reescribir `src/pages/DepositsPage.tsx` para cargar los depósitos con `useDepositos` y mostrar estados de carga y error (`Alert` con detalle del `ApiError`)
- [x] 3.2 Rediseñar la tarjeta de depósito con los campos reales (nombre, descripción, dirección, cantidad de espacios en tipografía mono) y la acción "Editar"
- [x] 3.3 Implementar el modal de alta/edición con campos nombre, descripción y dirección (precargados en edición), envío por `useCrearDeposito`/`useActualizarDeposito` y refresco del listado en el éxito
- [x] 3.4 Mostrar los botones "+ Nuevo depósito" y "Editar" únicamente al rol ADMIN (vía `useAuth().usuario.rol`)
- [x] 3.5 Agregar en `src/types/domain.ts` el campo opcional `espacios?: Espacio[]` al tipo `Deposito`
- [x] 3.6 Agregar al modal la sección "Espacios" con filas dinámicas (tipo, descripción, filas, columnas), botón "+ Agregar espacio" y acción de quitar por fila (los espacios existentes quitados se registran en un listado local para borrarse al guardar)
- [x] 3.7 Al abrir la edición, cargar los espacios existentes con `getDeposito(id)` y mostrarlos en la sección (con estado de carga y `Alert` de error en la sección)
- [x] 3.8 Persistir los espacios en el `onSuccess` de la mutación del depósito: `deleteEspacio` para los quitados, `updateEspacio` para los existentes y `createEspacio` para los nuevos (con el id del depósito); invalidar `['depositos']` y cerrar el modal; errores en `Alert`
- [x] 3.9 Deshabilitar el botón "Guardar" mientras se persisten el depósito y sus espacios, y mostrar "Guardando…" durante todo el proceso

## 4. Verificación

- [x] 4.1 Ejecutar `npm run build` sin errores de TypeScript (estado previo del change)
- [x] 4.2 Re-ejecutar `npm run build` sin errores tras incorporar la sección de espacios
- [ ] 4.3 Revisar visualmente en `npm run dev` el listado real, el alta con espacios y la edición con gestión de espacios (requiere backend y rol ADMIN)
