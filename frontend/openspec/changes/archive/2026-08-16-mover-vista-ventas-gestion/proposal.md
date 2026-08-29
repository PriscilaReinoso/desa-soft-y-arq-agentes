## Why

La vista de Ventas aparece agrupada bajo la categoría "Gestión" en la barra lateral, cuando debería vivir bajo la categoría "Ventas" junto con Presupuestos, que es su área funcional natural.

## What Changes

- Mover el ítem de navegación "Ventas" del grupo "Gestión" al grupo "Ventas" en la barra lateral (`src/components/layout/Sidebar.tsx`).
- El resto de ítems de "Gestión" (Inventario, Depósitos, Proveedores, Listas de precios) permanecen sin cambios, al igual que la URL `/ventas` y la ruta asociada.

## Capabilities

### New Capabilities
<!-- Capabilities being introduced. Replace <name> with kebab-case identifier (e.g., user-auth, data-export, api-rate-limiting). Each creates specs/<name>/spec.md -->
None

### Modified Capabilities
- `navegacion`: la barra lateral cambia la agrupación del ítem "Ventas", que pasa del grupo "Gestión" al grupo "Ventas".

## Impact

- `src/components/layout/Sidebar.tsx`: se modifica la entrada `{ to: '/ventas', ... }` para usar `group: 'Ventas'`.
- No afecta enrutado, servicios, tipos ni componentes de páginas.
