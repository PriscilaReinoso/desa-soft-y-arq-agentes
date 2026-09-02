## Context

El alta de listas de precios por Excel resuelve cada fila en
`ListaPreciosService._item_desde_fila`, que cuando se usa la columna combinada
llama a la función de módulo `_parsear_articulo_medida(texto)`. Esta
reconoce la unidad del texto buscando el último match del patrón
`<cantidad><unidad>` cuya palabra esté en el dict fijo `UNIDADES_CONOCIDAS`
(`lista_precios_service.py:49`). Ver proposal.md "Why" para la motivación; la
spec describe el contrato modificado (unidades desde la tabla `medida` con la
lista fija como respaldo).

El servicio tiene acceso a `self.db` y a `self.medida_repository`
(`MedidaRepository`), que ya posee `get_by_combinacion` y `list` pero no un
método para enumerar `unidad_medida`. Los tests de columna combinada se crean
con la tabla `medida` vacía al momento del parseo, por lo que con el respaldo
activo el comportamiento actual se conserva.

## Goals / Non-Goals

**Goals:**
- Las unidades reconocidas en el texto combinado provienen de la base de datos
  (columna `unidad_medida` de `Medida`, activas), unidas con `UNIDADES_CONOCIDAS`.
- La lista fija queda como respaldo: en caso de colisión, prevalece la unidad
  de la base de datos tal como está guardada.
- El mapa de unidades se resuelve una sola vez por petición de alta por Excel.

**Non-Goals:**
- Cambiar el split de columnas separadas (`unidad_medida` + `medida`), que ya
  resuelve contra la DB por texto exacto y no usa `UNIDADES_CONOCIDAS`.
- Reconocer unidades compuestas o con caracteres no alfabéticos (p. ej.
  "1/2", frases) desde el texto combinado: el patrón vigente solo captura
  palabras alfabéticas.
- Modificar el esquema de la base de datos ni endpoints de la API.

## Decisions

### El mapa de unidades es un dict palabra→canónico construido por request

`UNIDADES_CONOCIDAS` se reutiliza como respaldo sin tocarlo. Se agrega un
helper de módulo que fusiona ambos orígenes:

```python
def _mapa_unidades(unidades_db: list[str]) -> dict[str, str]:
    mapa = {u.lower(): u for u in unidades_db if u}          # DB prevalece
    for alias, canónico in UNIDADES_CONOCIDAS.items():
        mapa.setdefault(alias, canónico)                     # respaldo completa huecos
```

- Las claves se normalizan a minúsculas (el patrón ya baja el caso de la
  palabra capturada); el valor conserva el caso guardado en la DB para que
  `get_by_combinacion` (comparación exacta) siga encontrando la medida.
- `setdefault` garantiza que la DB gane en colisiones y que los alias del
  respaldo (`"un"→"unidad"`, `"mts"→"m"`, `"pz"→"pieza"`) sigan vigentes.
- Se construye una vez en `alta_excel` (antes del bucle de filas). Las medidas
  creadas durante el mismo request no alteran el mapa: el parseo corre antes
  del `_procesar_items` y el respaldo cubre lo no existente aún.

Alternativa descartada: consultar la DB por cada fila — costo innecesario y
cambio de comportamiento si una medida intermedia modificara el set.

### Repository: método `unidades()` en `MedidaRepository`

```python
def unidades(self) -> list[str]:
    stmt = select(Medida.unidad_medida).where(Medida.deleted_at.is_(None)).distinct()
    return [u for u in self.db.scalars(stmt).all() if u]
```

Sigue el patrón de `list`/`get_by_combinacion`; la capa de datos queda en el
repositorio, no en el servicio. Excluye `deleted_at` no nulo (baja lógica).

### Inyección del mapa en el parseo

- `_parsear_articulo_medida(texto, unidades)` recibe el mapa por parámetro y
  reemplaza el acceso directo a `UNIDADES_CONOCIDAS` por `unidades`.
- `_item_desde_fila(...)` recibe `unidades` y lo propaga a la llamada del
  parseo (`:343`).
- `alta_excel` obtiene `self.medida_repository.unidades()`, arma el mapa y lo
  pasa a cada `_item_desde_fila`.

Función de módulo sin acceso a `db`: no se inyecta la sesión en el helper, se
le pasa el valor ya resuelto, manteniéndola pura y testeable.

### La medida por defecto pasa de "no corresponde" a "1 unidad"

Cuando el texto combinado no tiene cantidad+unidad reconocible, hoy se devuelve
`MEDIDA_NO_CORRESPONDE` ("no corresponde"/"no corresponde") y el
look-or-create de `_resolve_medida` crea esa fila. El nuevo comportamiento
devuelve el par `("unidad", "1")`: `_item_desde_fila` lo resuelve con el mismo
`get_by_combinacion` + alta, por lo que la fila "1 unidad" se crea una vez y se
reutiliza entre filas sin lógica adicional. Esto alinea el backoffice con el
concepto de "cantidad 1" como medida genérica y deja de poblar la tabla con la
filas "no corresponde".

Alternativa descartada: seguir creando "no corresponde" y solo reusarla — el
usuario pidió explícitamente asociar estos artículos al registro "1 unidad".

## Risks / Trade-offs

- [Regresión en tests combinados actuales] → la DB está vacía al parsear en
  esos tests y el respaldo conserva el reconocimiento actual; el mapa solo
  agrega unidades. Los tests existentes deben pasar sin cambios.
- [Unidad de DB con mayúsculas/espacios no matcheable por el patrón] → el
  regex actual solo captura `[a-zA-ZñÑ]+`; unidades con caracteres raros no se
  reconocen. Es el comportamiento vigente, no se amplía en este change.
- [DB con muchas unidades duplica ligeramente la consulta por request] → una
  query `DISTINCT` por alta de Excel es despreciable frente a la carga del
  archivo; se computa una sola vez por request.

## Migration Plan

No aplica: no hay cambios de esquema ni de contratos de API. El deploy es
solo de código; rollback = revertir el commit (la lista fija sigue presente en
el respaldo).

## Open Questions

Ninguna: las decisiones quedan fijadas en la spec y el diseño; los detalles de
implementación (nombres de tests) se resuelven en tasks.