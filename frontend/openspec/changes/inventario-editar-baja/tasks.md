## 1. Hooks de inventario

- [ ] 1.1 Agregar en `src/hooks/useInventarios.ts` el hook `useActualizarInventario` (useMutation → `updateInventario`, invalida `['inventarios']`)
- [ ] 1.2 Agregar en `src/hooks/useInventarios.ts` el hook `useEliminarInventario` (useMutation → `deleteInventario`, invalida `['inventarios']`)

## 2. Columna de acciones

- [ ] 2.1 Agregar a la tabla de `src/pages/InventoryPage.tsx` una columna de acciones a la derecha con tres botones solo-ícono (sin texto): ✎ editar, 🛒 añadir a preventa (deshabilitado) y 🗑 eliminar
- [ ] 2.2 Mostrar los botones de editar y eliminar únicamente al rol ADMIN (vía `useAuth().usuario.rol`)

## 3. Modal de edición

- [ ] 3.1 Implementar el modal de edición precargado con espacio, fila, columna, stock y precio de venta del registro, con el artículo/medida como texto fijo (no editable)
- [ ] 3.2 Enviar `useActualizarInventario` al confirmar, refrescar el listado en el éxito y mostrar `Alert` con el detalle del `ApiError` en el fallo
- [ ] 3.3 Poblar el selector de espacio con `useEspacios`/`useDepositos` y mostrar el depósito de cada espacio

## 4. Baja

- [ ] 4.1 Implementar la baja con confirmación previa (`window.confirm`), envío por `useEliminarInventario`, refresco del listado en el éxito y `Alert` con el detalle del error en el fallo

## 5. Verificación

- [ ] 5.1 Ejecutar `npm run build` sin errores de TypeScript
- [ ] 5.2 Revisar visualmente en `npm run dev` los botones de íconos, la edición y la baja (requiere backend y rol ADMIN)
