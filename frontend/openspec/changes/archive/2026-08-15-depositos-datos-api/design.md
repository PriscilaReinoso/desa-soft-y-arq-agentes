## Context

`DepositsPage.tsx` renderiza `deposits` mock (con campos `name`, `location`, `capacity`, `items`, `manager`, `categories` que no existen en la API). El backend expone `GET/POST/PUT/DELETE /api/v1/depositos` con los campos `nombre`, `descripcion`, `direccion` y `cantidad_espacios` (cantidad calculada de espacios del depósito); las operaciones de escritura requieren rol ADMIN. Los espacios se crean, actualizan y eliminan por separado con `POST/PUT/DELETE /api/v1/espacios`. `GET /api/v1/depositos/{id}` hoy NO devuelve la lista de espacios, solo `cantidad_espacios`; exponerla es responsabilidad del change backend asociado `deposito-espacios`. El frontend ya tiene `listDepositos`, `getDeposito`, `createDeposito` y `updateDeposito` en `depositos.service.ts` y `createEspacio`, `updateEspacio` y `deleteEspacio` en `espacios.service.ts`; y `useDepositos` (`['depositos']`). No existe componente de modal en `src/components/ui`. Ver proposal.md - Why para la motivación.

## Goals / Non-Goals

**Goals:**
- Mostrar depósitos reales de la API con sus campos reales.
- Permitir alta y edición de depósitos mediante un modal.
- Permitir crear espacios en el alta y listar, modificar, quitar y agregar espacios en la edición, desde el mismo modal.
- Reutilizar la infraestructura UI existente (Card, Badge, Button, Field, Input, Alert, PageContainer).

**Non-Goals:**
- No agregar baja de depósitos (el caso de uso solo pide alta y edición; la API tiene DELETE pero no se expone en esta iteración).
- No conservar campos mock (ocupación, responsable, categorías) sin respaldo en la API.
- No administrar `cantidad_espacios` manualmente: lo mantiene el backend (se incrementa/decrementa al crear/eliminar espacios).

## Decisions

- **Nuevo componente `Modal` (`src/components/ui/Modal.tsx`)**: overlay fijo con panel centrado, cierre por botón ✕, clic en el overlay y tecla Escape, ancho configurable. Reutilizable por este change y por `inventario-editar-baja`. Alternativa considerada: lib de modales — descartada para no agregar dependencias.
- **Formulario único de alta/edición**: un solo componente de formulario con modo `create` | `edit` y `defaultValues` precargados en edición, para no duplicar los campos nombre/descripción/dirección.
- **Sección "Espacios" con filas dinámicas**: cada fila tiene `tipo`, `descripcion`, `max_fila` y `max_columna`, un botón para quitarla y un botón "+ Agregar espacio" para añadir filas. Las filas tienen `key` local (no-API) para React; las que provienen de la API conservan su `id` y las nuevas no.
- **Alta**: al confirmar se envía `POST /api/v1/depositos` y, con el id del depósito creado, `POST /api/v1/espacios` por cada fila nueva. Los espacios se envían con `max_fila`/`max_columna` ≥ 0 (se parsean como enteros, 0 si quedan vacíos).
- **Edición**: al abrir el modal se carga el detalle con `getDeposito(id)` (el backend expone `espacios`); mientras carga se muestra un estado de carga y, si falla, un `Alert` en la sección. Las filas existentes se quitan de la lista y se registran en un listado local `deletedIds` para enviar `DELETE /api/v1/espacios/{id}` al guardar.
- **Persistencia secuenciada en el `onSuccess` de la mutación del depósito**: se usa `useCrearDeposito`/`useActualizarDeposito` para el guardado del depósito y, en `onSuccess`, una función async que aplica en orden `deleteEspacio` (quitados), `updateEspacio` (existentes) y `createEspacio` (nuevos); al final invalida `['depositos']` y cierra el modal. Los errores de la persistencia de espacios se capturan y se muestran en un `Alert` dentro del modal. La persistencia de espacios usa los services directamente (no `useMutation`) por la secuencia estricta con el alta del depósito.
- **`Deposito.espacios?: Espacio[]`**: el tipo `Deposito` en `src/types/domain.ts` gana el campo opcional para el detalle (el listado no lo trae).
- **Campos de la tarjeta**: se muestran `nombre` (título), `descripcion` (subtítulo), `direccion` (línea con 📍) y `cantidad_espacios` (valor mono). Se eliminan los botones "Ver artículos" y las barras de ocupación por no tener respaldo de API.
- **Hooks nuevos en `useDepositos.ts`**: `useCrearDeposito` y `useActualizarDeposito` como `useMutation` que invalidan `['depositos']` en `onSuccess`. Se reusa el service existente.
- **Alta/edición solo para ADMIN**: el backend restringe la escritura a `require_roles("ADMIN")`; el botón "+ Nuevo depósito", "Editar" y la sección "Espacios" se muestran únicamente al rol ADMIN (vía `useAuth().usuario.rol`) para evitar errores de autorización en la UI.
- **Errores**: `Alert` con detalle del `ApiError` para carga y para fallos de create/update (modal).

## Risks / Trade-offs

- [El modal con Escape/overlay agrega complejidad de foco] → Se limita a comportamiento básico (clic fuera y Escape cierran); no se implementa trampa de foco completa.
- [Ocultar botones por rol puede dejar al ADMIN sin poder si el rol difiere en formato] → El backend compara rol exacto "ADMIN"; se usa el mismo valor que devuelve el login.
- [La edición depende del backend que exponga `espacios` en el detalle] → El change backend `deposito-espacios` la habilita; si el detalle falla, la sección muestra un `Alert` y el resto del modal sigue operable.
- [La persistencia de espacios en el `onSuccess` puede dejarlos a medias si un espacio falla] → Se envían en orden y ante el primer error se muestra el detalle en el `Alert`; el listado se refresca igualmente al invalidar.
