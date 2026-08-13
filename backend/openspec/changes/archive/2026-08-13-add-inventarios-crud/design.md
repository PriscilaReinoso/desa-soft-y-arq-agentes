## Context

La capa por capas del backend está asentada. Este change agrega la entidad
`inventario` de `docs/db_schema.md`, que une `articulo`, `medida` y `espacio`
(opcional). Depende de que existan esos modelos (changes `add-articulos-crud`,
`add-medidas-crud`, `add-espacios-crud`).

## Goals / Non-Goals

**Goals:**
- Modelo `Inventario` en singular, tabla `inventario`, con soft delete y
  timestamps de auditoría.
- CRUD completo de inventario en la capa correspondiente.
- Validación de las reglas: `stock >= 0`, `precio_venta >= 0`, `fila/columna
  >= 0`, `espacio_id` nulo solo si `stock == 0`, y unicidad de
  `articulo_id` + `medida_id`.

**Non-Goals:**
- Alta compuesta que cree artículo/medida/espacio (change
  `add-alta-inventario-compuesto`).
- CRUD de las entidades referenciadas.

## Decisions

### 1. Unicidad y checks a nivel de base + validación en el Service
Se materializan `UNIQUE(articulo_id, medida_id)`, `CHECK(stock >= 0)` y
`CHECK(precio_venta >= 0)` en el modelo. La regla "espacio obligatorio si
stock > 0" y la validación de referencias (`articulo_id`, `medida_id`,
`espacio_id` existentes) se implementan en el Service, porque dependen de
entidades relacionadas y del estado del ítem.

### 2. Regla de espacio condicional al stock
La regla de negocio (espacio nulo solo si stock == 0) se aplica tanto en
creación como en actualización. Si se actualiza stock a 0 con un espacio
asignado, se permite conservar la referencia; si el stock pasa a > 0 sin
espacio, se rechaza con HTTP 422.

### 3. Soft delete con filtro explícito en el Repository
Se sigue el patrón de `RolRepository`: filtro `deleted_at.is_(None)` y baja
lógica con `deleted_at = utcnow()`.

### 4. Relaciones bidireccionales
`Inventario.articulo`, `Inventario.medida`, `Inventario.espacio` (N:1) y las
colecciones inversas en los modelos padre, con `back_populates`.

### 5. Schemas Pydantic por operación
`InventarioCreate`, `InventarioUpdate` y `InventarioOut`, siguiendo
`app/schemas/rol.py` (`ConfigDict(from_attributes=True)`).

### 6. Respuesta con objetos relacionados completos
`InventarioOut` incluye los campos propios del ítem (`id`, `fila`, `columna`,
`stock`, `precio_venta`) y los objetos anidados `articulo`, `medida` y
`espacio` (opcional). Los anidados reutilizan los schemas `Out` existentes
extendidos con sus relaciones: `articulo` incluye su `categoria` y `espacio`
incluye su `deposito`. Los identificadores de los relacionados no se repiten a
nivel del ítem: solo viven dentro de su objeto (`articulo.id`, `medida.id`,
`espacio.id`). Para evitar consultas N+1, el Repository eager-loada las
relaciones (`selectinload`) en `list` y `get`.

## Risks / Trade-offs

- **UNIQUE(articulo_id, medida_id) + soft delete** → un ítem eliminado
  lógicamente conserva la combinación y bloquea re-crearla. Mitigación:
  validación en el Service contra todos los registros; índice parcial como
  mejora futura.
- **Regla espacio/stock en dos lugares** → se duplica en create y update.
  Mitigación: helper compartido en el Service para la validación de ubicación.
