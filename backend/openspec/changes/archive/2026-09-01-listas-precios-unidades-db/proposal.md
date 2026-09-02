## Why

El parseo de la columna combinada (`articulo_medida_combinado`) de las listas
de precios por Excel usa una lista fija de unidades hardcodeada
(`UNIDADES_CONOCIDAS`). Esto hace que unidades reales cargadas en la tabla
`medida` no se reconozcan en el texto (p. ej. "Tornillo 5caja" da "no
corresponde" aunque "caja" ya exista como medida), obligando a editar código
para agregar cada nueva unidad. Se necesita que las unidades conocidas surjan
de la base de datos, manteniendo la lista fija como respaldo.

## What Changes

- El set de unidades reconocidas para dividir `articulo / unidad / cantidad`
  en la columna combinada pasa a ser la unión de las unidades activas de la
  tabla `medida` (columna `unidad_medida`, sin `deleted_at`) y la lista fija
  `UNIDADES_CONOCIDAS` como respaldo. En caso de colisión, gana la unidad de
  la base de datos.
- Se agrega un método de repositorio que devuelve las `unidad_medida`
  existentes (distintas, activas) de la tabla `medida`.
- El mapa de unidades se construye una vez por petición de alta por Excel y
  se inyecta al parseo de la columna combinada.
- La medida no existente se sigue creando tras el parseo (`get_by_combinacion`
  con look-or-create). Cuando no hay match (ni en DB ni en el respaldo), el
  artículo se asocia a la medida por defecto "1 unidad" (`unidad_medida`
  "unidad", `medida` "1"), que se reutiliza entre filas y se crea si no
  existe; se abandona el uso de la medida "no corresponde".
- No hay cambios de esquema ni migraciones.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `listas-precios`: se modifica el requerimiento "Alta de lista de precios por
  Excel" en la parte del parseo de la columna combinada: las unidades
  conocidas pasan de ser una lista fija de código a las unidades activas de la
  tabla `medida`, con la lista fija como respaldo.

## Impact

- `app/services/lista_precios_service.py`: `_parsear_articulo_medida` y
  `_item_desde_fila` reciben el mapa de unidades; `alta_excel` construye el
  mapa desde la DB una vez por petición.
- `app/repositories/medida_repository.py`: nuevo método para listar
  `unidad_medida` activas.
- `tests/test_lista_precios.py`: tests existentes deben seguir pasando
  (a DB vacía, el respaldo conserva el comportamiento actual); se agregan
  tests para unidades provenientes de la base de datos.
- No afecta endpoints ni respuestas de la API: mismo contrato de alta por
  Excel, solo cambia la capacidad de reconocimiento de unidades.