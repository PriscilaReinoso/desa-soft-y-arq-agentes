## Why

La vista de depósitos muestra datos mock con campos que no existen en el backend (ocupación, artículos, responsable, categorías). El backend ya expone el CRUD completo de depósitos (`GET/POST/PUT /api/v1/depositos`), por lo que la vista debe mostrar los depósitos reales y permitir darlos de alta y editarlos. Además, el modal de alta/edición no permite crear espacios: los espacios se crean por separado (`POST /api/v1/espacios`) y el detalle del depósito (`GET /api/v1/depositos/{id}`) no expone su lista, impidiendo listarlos y modificarlos desde el modal.

## What Changes

- Reemplazar los datos mock de `DepositsPage` por los depósitos reales de `GET /api/v1/depositos`.
- Rediseñar la tarjeta de depósito para mostrar los campos reales de la API: nombre, descripción, dirección y cantidad de espacios.
- Implementar el alta: el botón "+ Nuevo depósito" abre un modal con los campos nombre, descripción y dirección y una sección "Espacios" para cargar espacios nuevos (tipo, descripción, filas y columnas). Al confirmar envía `POST /api/v1/depositos` y, ante el éxito, crea cada espacio con `POST /api/v1/espacios`.
- Implementar la edición: el botón "Editar" de cada tarjeta abre un modal precargado que envía `PUT /api/v1/depositos/{id}` y además lista los espacios existentes del depósito (vía `GET /api/v1/depositos/{id}`), permitiendo modificarlos (`PUT /api/v1/espacios/{id}`), quitarlos (`DELETE /api/v1/espacios/{id}`) y agregar nuevos (`POST /api/v1/espacios`).
- Agregar estados de carga y error para la consulta y las operaciones (el 401 ya redirige al login).

## Capabilities

### New Capabilities

- (ninguna)

### Modified Capabilities

- `depositos`: los requisitos de encabezado/alta y de tarjetas cambian para usar datos reales de la API (campos nombre, descripción, dirección y cantidad de espacios), incorporar el alta y la edición de depósitos y gestionar los espacios desde el modal de alta/edición.

## Impact

- `src/pages/DepositsPage.tsx`: reescritura para cargar la API, agregar modales de alta/edición y la sección "Espacios" (filas dinámicas y gestión de existentes).
- `src/components/ui/Modal.tsx`: nuevo componente de modal (overlay + panel) reutilizable.
- `src/hooks/useDepositos.ts`: nuevos hooks `useCrearDeposito` y `useActualizarDeposito` (useMutation que invalidan `['depositos']`).
- `src/services/depositos.service.ts` y `src/services/espacios.service.ts`: ya contienen `createDeposito`, `updateDeposito`, `getDeposito`, `createEspacio`, `updateEspacio` y `deleteEspacio`, no requieren cambios.
- `src/types/domain.ts`: el tipo `Deposito` gana el campo opcional `espacios?: Espacio[]` (presente en el detalle de `GET /api/v1/depositos/{id}`).
- Backend: dependencia del change asociado `deposito-espacios` para que `GET /api/v1/depositos/{id}` incluya la lista de espacios no eliminados.
