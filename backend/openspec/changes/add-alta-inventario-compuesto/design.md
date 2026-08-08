## Context

Este change extiende el módulo de inventario con una operación de alta
compuesta y transaccional. Depende de los cambios CRUD previos
(`add-articulos-crud`, `add-medidas-crud`, `add-espacios-crud` e
`add-inventarios-crud`), cuyos modelos, repositorios y servicios se
reutilizan. La motivación está en proposal.md y los requisitos en el spec
`alta-inventario`.

## Goals / Non-Goals

**Goals:**
- Endpoint de alta que reciba artículo, medida y espacio (existentes o
  nuevos) y cree el inventario en una sola operación.
- Atomicidad: si cualquier alta de componente falla, no se persiste nada
  (rollback completo).
- Mantener las reglas del inventario (unicidad artículo + medida, stock >= 0,
  precio >= 0, espacio nulo solo si stock == 0).

**Non-Goals:**
- Modificar el CRUD de inventario existente.
- Soporte para actualizar o eliminar componentes durante el alta.

## Decisions

### 1. Transacción en una única sesión de base de datos
El alta compuesta se ejecuta en una sola sesión. Cada componente nuevo se
inserta con `flush()` (sin commit) para obtener su `id` y poder referenciarlo;
solo al finalizar todas las altas se hace `commit()`. Si algo falla, el
Service hace `rollback()` y propaga la excepción. Los repositorios base
(`articulo`, `medida`, `espacio`) deben poder insertar sin commit para
componerse; se reutilizan exponiendo la sesión compartida.

### 2. Componentes "nuevo" vs "existente" por presencia de `id`
El cuerpo del alta usa esquemas que permiten ambas formas:
- Artículo: `ArticuloAlta { id: UUID | None, nombre?, descripcion?,
  categoria_id? }`.
- Medida: `MedidaAlta { id: UUID | None, unidad_medida?, medida? }`.
- Espacio: `EspacioAlta { id: UUID | None, deposito_id?, tipo?, max_fila?,
  max_columna? } | None`.

Si viene `id`, se valida existencia (HTTP 400/404 si no); si no, se crea. La
validez de los datos nuevos se delega a las reglas de los CRUD base.

### 3. Orden de creación de componentes
1. Artículo (si es nuevo).
2. Medida (si es nueva).
3. Espacio (si es nuevo).
4. Inventario con los ids resueltos y las reglas de ubicación/stock.

El espacio se crea antes del inventario porque el ítem lo referencia; el stock
se valida con la misma regla de espacio nulo solo si stock == 0.

### 4. Servicio de alta dedicado
`app/services/alta_inventario_service.py` coordina los servicios base dentro
de la sesión; el router expone `POST /inventario/alta`. No se agrega lógica
nueva de negocio fuera de la composición y el manejo de transacción.

## Risks / Trade-offs

- **Repositorios con commit interno** → los repositorios base actuales
  commitean solos (`add` hace commit), lo que rompería la atomicidad.
  Mitigación: se refactorizan para exponer una variante sin commit
  (`add_no_commit` / flush) que el servicio de alta usa dentro de la sesión.
- **Duplicación de validaciones** → se reutilizan los services base para las
  altas individuales y se centraliza la regla de unicidad artículo + medida.
- **Fallo a mitad de camino** → si el espacio se crea y luego falla el
  inventario, el `rollback()` revierte el espacio; se verifica con pruebas de
  rollback.

## Migration Plan

Sin migraciones nuevas: usa tablas ya creadas por los changes CRUD. Solo se
agrega el router y el servicio.

## Open Questions

- Nada que cambie specs o enfoque: el naming del endpoint (`POST /inventario`
  extendido vs `POST /inventario/alta`) es decisión de implementación y puede
  resolverse durante el apply.
