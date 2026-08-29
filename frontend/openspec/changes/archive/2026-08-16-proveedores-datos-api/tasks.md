## 1. Tipos y servicio

- [x] 1.1 Reemplazar en `src/types/domain.ts` el tipo `Proveedor` mock por el shape de la API (`id`, `nombre`, `apellido`, `telefono`, `direccion`, `categorias`) y agregar `ProveedorCreatePayload`/`ProveedorUpdatePayload` con `categoria_ids`
- [x] 1.2 Crear `src/services/proveedores.service.ts` con `listProveedores`, `getProveedor`, `createProveedor`, `updateProveedor` y `deleteProveedor` (patrón de `depositos.service.ts`)

## 2. Hook

- [x] 2.1 Crear `src/hooks/useProveedores.ts` con `useProveedores`, `useCrearProveedor`, `useActualizarProveedor` y `useEliminarProveedor`, invalidando `['proveedores']` tras cada mutation

## 3. Vista

- [x] 3.1 En `src/pages/SuppliersPage.tsx`: reemplazar el mock por `useProveedores()` con estados de loading y error (estilo `DepositsPage`), y contar proveedores desde los datos de API
- [x] 3.2 Rediseñar la tarjeta para mostrar nombre y apellido, teléfono, dirección y categorías como etiquetas (sin último pedido, saldo ni rating)
- [x] 3.3 Filtrar la búsqueda por nombre, apellido o teléfono
- [x] 3.4 Agregar modal de alta/edición con `react-hook-form` (nombre, apellido, teléfono requeridos; dirección opcional) y checkboxes de categorías desde `useCategorias`, preseleccionadas al editar; alta con `POST` y edición con `PUT` enviando `categoria_ids`
- [x] 3.5 Agregar baja con confirmación (`DELETE`) y mostrar las acciones "+ Nuevo proveedor", "Editar" y "Eliminar" solo para rol ADMIN; mostrar errores de API en el listado y el modal
- [x] 3.6 Ejecutar `npm run build` y confirmar que compila sin errores
