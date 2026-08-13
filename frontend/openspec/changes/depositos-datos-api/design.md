## Context

`DepositsPage.tsx` renderiza `deposits` mock (con campos `name`, `location`, `capacity`, `items`, `manager`, `categories` que no existen en la API). El backend expone `GET/POST/PUT/DELETE /api/v1/depositos` con los campos `nombre`, `descripcion`, `direccion` y `cantidad_espacios` (cantidad calculada de espacios del depósito); las operaciones de escritura requieren rol ADMIN. El frontend ya tiene `listDepositos`, `createDeposito` y `updateDeposito` en `depositos.service.ts` y `useDepositos` (`['depositos']`). No existe componente de modal en `src/components/ui`. Ver proposal.md - Why para la motivación.

## Goals / Non-Goals

**Goals:**
- Mostrar depósitos reales de la API con sus campos reales.
- Permitir alta y edición de depósitos mediante un modal.
- Reutilizar la infraestructura UI existente (Card, Badge, Button, Field, Input, Alert, PageContainer).

**Non-Goals:**
- No agregar baja de depósitos (el caso de uso solo pide alta y edición; la API tiene DELETE pero no se expone en esta iteración).
- No conservar campos mock (ocupación, responsable, categorías) sin respaldo en la API.
- No tocar el backend.

## Decisions

- **Nuevo componente `Modal` (`src/components/ui/Modal.tsx`)**: overlay fijo con panel centrado, cierre por botón ✕, clic en el overlay y tecla Escape, ancho configurable. Reutilizable por este change y por `inventario-editar-baja`. Alternativa considerada: lib de modales — descartada para no agregar dependencias.
- **Formulario único de alta/edición**: un solo componente de formulario con modo `create` | `edit` y `defaultValues` precargados en edición, para no duplicar los campos nombre/descripción/dirección.
- **Campos de la tarjeta**: se muestran `nombre` (título), `descripcion` (subtítulo), `direccion` (línea con 📍) y `cantidad_espacios` (valor mono). Se eliminan los botones "Ver artículos" y las barras de ocupación por no tener respaldo de API.
- **Hooks nuevos en `useDepositos.ts`**: `useCrearDeposito` y `useActualizarDeposito` como `useMutation` que invalidan `['depositos']` en `onSuccess`. Se reusa el service existente.
- **Alta/edición solo para ADMIN**: el backend restringe la escritura a `require_roles("ADMIN")`; el botón "+ Nuevo depósito" y "Editar" se muestran únicamente al rol ADMIN (vía `useAuth().usuario.rol`) para evitar errores de autorización en la UI.
- **Errores**: `Alert` con detalle del `ApiError` para carga y para fallos de create/update (modal).

## Risks / Trade-offs

- [El modal con Escape/overlay agrega complejidad de foco] → Se limita a comportamiento básico (clic fuera y Escape cierran); no se implementa trampa de foco completa.
- [Ocultar botones por rol puede dejar al ADMIN sin poder si el rol difiere en formato] → El backend compara rol exacto "ADMIN"; se usa el mismo valor que devuelve el login.
