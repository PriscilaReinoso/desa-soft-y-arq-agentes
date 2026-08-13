## Why

La vista de depósitos muestra datos mock con campos que no existen en el backend (ocupación, artículos, responsable, categorías). El backend ya expone el CRUD completo de depósitos (`GET/POST/PUT /api/v1/depositos`), por lo que la vista debe mostrar los depósitos reales y permitir darlos de alta y editarlos.

## What Changes

- Reemplazar los datos mock de `DepositsPage` por los depósitos reales de `GET /api/v1/depositos`.
- Rediseñar la tarjeta de depósito para mostrar los campos reales de la API: nombre, descripción, dirección y cantidad de espacios.
- Implementar el alta: el botón "+ Nuevo depósito" abre un modal con los campos nombre, descripción y dirección que envía `POST /api/v1/depositos`.
- Implementar la edición: el botón "Editar" de cada tarjeta abre un modal precargado que envía `PUT /api/v1/depositos/{id}`.
- Agregar estados de carga y error para la consulta y las operaciones (el 401 ya redirige al login).

## Capabilities

### New Capabilities

- (ninguna)

### Modified Capabilities

- `depositos`: los requisitos de encabezado/alta y de tarjetas cambian para usar datos reales de la API (campos nombre, descripción, dirección y cantidad de espacios) e incorporar el alta y la edición de depósitos.

## Impact

- `src/pages/DepositsPage.tsx`: reescritura para cargar la API y agregar modales de alta/edición.
- `src/components/ui/Modal.tsx`: nuevo componente de modal (overlay + panel) reutilizable.
- `src/hooks/useDepositos.ts`: nuevos hooks `useCrearDeposito` y `useActualizarDeposito` (useMutation que invalidan `['depositos']`).
- `src/services/depositos.service.ts`: ya contiene `createDeposito` y `updateDeposito`, no requiere cambios.
- Sin cambios en el backend: el CRUD de depósitos ya existe (escritura restringida a rol ADMIN).
