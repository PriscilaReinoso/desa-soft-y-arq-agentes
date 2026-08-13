## 1. Componente Modal

- [ ] 1.1 Crear `src/components/ui/Modal.tsx`: overlay fijo, panel centrado, botón ✕, cierre por clic fuera y Escape, prop `open`, `onClose`, `title` y `children`

## 2. Hooks de depósitos

- [ ] 2.1 Agregar en `src/hooks/useDepositos.ts` el hook `useCrearDeposito` (useMutation → `createDeposito`, invalida `['depositos']`)
- [ ] 2.2 Agregar en `src/hooks/useDepositos.ts` el hook `useActualizarDeposito` (useMutation → `updateDeposito`, invalida `['depositos']`)

## 3. Página de depósitos

- [ ] 3.1 Reescribir `src/pages/DepositsPage.tsx` para cargar los depósitos con `useDepositos` y mostrar estados de carga y error (`Alert` con detalle del `ApiError`)
- [ ] 3.2 Rediseñar la tarjeta de depósito con los campos reales (nombre, descripción, dirección, cantidad de espacios en tipografía mono) y la acción "Editar"
- [ ] 3.3 Implementar el modal de alta/edición con campos nombre, descripción y dirección (precargados en edición), envío por `useCrearDeposito`/`useActualizarDeposito` y refresco del listado en el éxito
- [ ] 3.4 Mostrar los botones "+ Nuevo depósito" y "Editar" únicamente al rol ADMIN (vía `useAuth().usuario.rol`)

## 4. Verificación

- [ ] 4.1 Ejecutar `npm run build` sin errores de TypeScript
- [ ] 4.2 Revisar visualmente en `npm run dev` el listado real, el alta y la edición (requiere backend y rol ADMIN)
