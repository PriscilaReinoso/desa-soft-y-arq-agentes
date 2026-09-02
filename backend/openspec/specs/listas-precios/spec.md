# Listas Precios Specification

## Purpose

Permite administrar las listas de precios de los proveedores: alta por JSON o
Excel con creación o reutilización de artículos y medidas, lectura con filtros,
actualización del precio de lista y baja lógica.

## Requirements

### Requirement: Alta de lista de precios por JSON

El sistema SHALL permitir dar de alta uno o varios registros de lista de
precios en una sola petición JSON. El header de la petición contiene el
proveedor: o bien `proveedor_id` (existente) o bien un objeto proveedor sin
`id` que se da de alta siguiendo las reglas del CRUD de proveedores; si no se
puede dar de alta el proveedor, no se persiste nada.

Cada ítem del array contiene el artículo (con su `medida`) y el `precio_lista`
(`>= 0`). El artículo puede venir con `id` (existente, se reutiliza) o sin `id`
(se da de alta; si ya existe uno con el mismo nombre, se reutiliza en lugar de
duplicarse). La categoría del artículo es opcional: si no se envía, el
artículo se crea sin categoría (`categoria_id` null). Puede recibirse un
`id_articulo_proveedor` propio del proveedor, que se almacena como tal y NO se
usa como id del artículo (el id del artículo se autogenera si no existe). Si
ya existe un registro activo para la combinación proveedor + artículo, se
actualiza con los datos enviados (`medida`, `id_articulo_proveedor` y
`precio_lista`) en lugar de duplicarse. Si falla el alta de un artículo,
medida o registro, se realiza rollback completo (no se persiste nada de lo
anterior).

#### Scenario: Alta exitosa con proveedor existente y artículos nuevos
- **WHEN** se envía un `proveedor_id` válido y artículos sin `id` con su `medida` y `precio_lista >= 0`
- **THEN** el sistema crea los artículos, medidas y registros de lista de precios y responde HTTP 201

#### Scenario: Alta exitosa reutilizando artículos existentes
- **WHEN** se envían artículos con `id` existentes o con el nombre de un artículo ya existente
- **THEN** el sistema reutiliza los artículos existentes y crea los registros de lista de precios y responde HTTP 201

#### Scenario: Alta con proveedor nuevo
- **WHEN** se envía un objeto proveedor sin `id`
- **THEN** el sistema da de alta el proveedor y luego crea los registros de lista de precios y responde HTTP 201

#### Scenario: Proveedor nuevo inválido impide el alta
- **WHEN** el objeto proveedor sin `id` no puede darse de alta (p.ej. teléfono duplicado)
- **THEN** el sistema rechaza la petición y no persiste ningún registro

#### Scenario: Precio de lista negativo
- **WHEN** se envía un `precio_lista` menor que 0 en alguno de los ítems
- **THEN** el sistema rechaza la petición con HTTP 422 y no persiste nada

#### Scenario: Falla en uno de los ítems con rollback
- **WHEN** uno de los artículos o medidas del array no puede darse de alta
- **THEN** el sistema rechaza la petición y revierte todo lo insertado (rollback)

#### Scenario: Artículo o proveedor inexistente
- **WHEN** se envía un `articulo_id` o `proveedor_id` que no existe o está eliminado
- **THEN** el sistema rechaza la petición con HTTP 400 y no persiste nada

#### Scenario: Registro existente para proveedor y artículo se actualiza
- **WHEN** se envía un ítem cuya combinación `proveedor_id` + `articulo_id` ya tiene un registro activo
- **THEN** el sistema actualiza ese registro (medida, id_articulo_proveedor y precio_lista) y responde HTTP 201 sin duplicarlo

### Requirement: Alta de lista de precios por Excel

El sistema SHALL permitir dar de alta listas de precios a partir de un archivo
Excel con una o varias líneas. Se recibe un JSON de mapeo (array) cuya key es
el nombre de columna de la base de datos y cuyo value es el nombre de columna
del Excel. El proveedor se recibe como header del JSON: `proveedor_id` o un
objeto proveedor sin `id` (se da de alta; si no se puede, no se persiste nada).
Por cada línea se aplican las mismas reglas del alta por JSON (alta o
reutilización de artículos y medidas, `id_articulo_proveedor`, `precio_lista >=
0`). Si el valor de alguna línea impide el insert, no se da de alta nada de lo
anterior (rollback) y se informa la línea y columna que generó el conflicto.

Además de las claves por columnas separadas, el mapeo admite la clave
`articulo_medida_combinado`, que apunta a una única columna del Excel cuyo
texto contiene el artículo y, opcionalmente, cantidad y unidad (p. ej.
"arandelas 1/8 2kg", "DISCO DE CORTE 115MM KUPER"). El sistema normaliza los
saltos de línea y espacios del texto y busca la última aparición del patrón
`<cantidad><unidad>` en cualquier posición. Las unidades reconocidas son las
`unidad_medida` activas (sin `deleted_at`) existentes en la tabla `medida`,
tomadas de la base de datos al inicio de la petición, más una lista fija de
respaldo insensible a mayúsculas (kg; g; l/ml/lt/lts; m/mt/mts; cm; mm;
u/un/unidad/unidades; pz/pieza/piezas). Si una misma palabra está en ambas
fuentes, el sistema usa la unidad de la base de datos. La parte restante es el
nombre del artículo, la unidad canónica se guarda en `unidad_medida` y la
cantidad en `medida`. Si la combinación `unidad_medida` + cantidad no existe,
el sistema la crea (o reutiliza la existente). Si el texto no contiene ninguna
cantidad+unidad reconocible (ni en la base de datos ni en la lista de
respaldo), el artículo se crea con el texto completo como nombre y se asocia a
la medida por defecto "1 unidad" (`unidad_medida` "unidad" y `medida` "1"),
que se reutiliza entre filas y se crea si aún no existe. La clave
`articulo_medida_combinado` no puede
combinarse en el mismo mapeo con `articulo_id`, `nombre`, `unidad_medida`,
`medida` ni `medida_id`. La columna de categoría es opcional: si no se mapea o
la celda está vacía, el artículo se crea sin categoría (`categoria_id` null);
si la celda tiene un valor y la categoría no existe, se genera conflicto.

Las líneas que no tengan contenido suficiente en las columnas esenciales del
mapeo (identificación del artículo, medida o precio de lista) no generan
error: se descartan y continúa el procesamiento del resto del archivo. La
respuesta incluye los registros creados o actualizados y una leyenda con el
número de línea y el motivo de cada línea descartada por falta de contenido.
Los valores presentes pero inválidos (p.ej. categoría inexistente o precio
negativo) siguen provocando rollback total informando la línea y columna. El
precio de lista puede incluir símbolos o prefijos de moneda (`$` o `USD`) y
usar coma decimal o puntos de miles (formato local); esos caracteres se
normalizan antes de validar que sea numérico y `>= 0`.

#### Scenario: Alta exitosa por Excel
- **WHEN** se envía un Excel cuyas líneas son válidas y un mapeo correcto
- **THEN** el sistema crea los registros y responde HTTP 201

#### Scenario: Alta exitosa con columna combinada artículo y medida
- **WHEN** una línea tiene "arandelas 1/8 2kg" en la columna mapeada a `articulo_medida_combinado`
- **THEN** el sistema crea el artículo con nombre "arandelas 1/8" y la medida con `unidad_medida` "kg" y `medida` "2", y responde HTTP 201

#### Scenario: Medida en el medio del texto combinado
- **WHEN** una línea tiene "DISCO DE CORTE 115MM KUPER"
- **THEN** el sistema extrae la medida (mm / 115), la quita del nombre y crea el artículo "DISCO DE CORTE KUPER"

#### Scenario: Normalización de unidad, coma decimal y saltos de línea
- **WHEN** una línea tiene "SIERRA COPA\n 11 PIEZAS IMP" u otra con cantidad decimal como "cable 1,5m"
- **THEN** el sistema normaliza los espacios, la unidad a su forma canónica ("pieza") y la coma decimal a punto ("1.5")

#### Scenario: Unidad existente en la base de datos se reconoce en el texto combinado
- **WHEN** existe una medida activa con `unidad_medida` que no está en la lista de respaldo (p. ej. "caja") y una línea combinada trae "Tornillo 5caja"
- **THEN** el sistema divide articulo "Tornillo", unidad "caja" y cantidad "5", reutiliza la medida existente si coincide la cantidad o la crea si no, y responde HTTP 201

#### Scenario: La unidad de la base de datos prevalece sobre el respaldo
- **WHEN** una palabra está tanto en la tabla `medida` como en la lista de respaldo
- **THEN** el sistema usa como unidad canónica el valor de la base de datos

#### Scenario: Reutilización de artículo existente desde columna combinada
- **WHEN** el nombre parseado de la columna combinada corresponde a un artículo existente
- **THEN** el sistema reutiliza el artículo existente para el registro de lista de precios

#### Scenario: Texto sin cantidad o unidad reconocible usa la medida 1 unidad
- **WHEN** el texto de la columna combinada no contiene cantidad+unidad reconocible ni en la base de datos ni en el respaldo (p. ej. "MASCARA FOTOSENSIBLE TOOLMAK", o "Tornillo 5caja" cuando "caja" no existe)
- **THEN** el sistema crea el artículo con el texto completo como nombre y lo asocia a la medida "1 unidad" (`unidad_medida` "unidad", `medida` "1")

#### Scenario: Reutilización de la medida 1 unidad entre filas
- **WHEN** varias líneas sin medida parseable se cargan en la misma petición
- **THEN** todas comparten la misma fila de medida "1 unidad"

#### Scenario: Alta sin categoría crea el artículo con categoría nula
- **WHEN** el mapeo no incluye la columna de categoría, o la celda de categoría está vacía en alguna línea
- **THEN** el artículo se crea igual con `categoria_id` null y responde HTTP 201

#### Scenario: Líneas separadoras o incompletas se descartan
- **WHEN** el archivo incluye líneas divisorias o informativas sin contenido suficiente en las columnas esenciales (p. ej. título de lista, nota, o celdas vacías en la columna del artículo)
- **THEN** esas líneas se descartan, el resto se procesa y la respuesta informa el número de línea y el motivo de cada descarte junto con los registros creados

#### Scenario: Precio con moneda y formato local
- **WHEN** la columna de precio trae valores como "$ 25", "USD 1,76" o "1.234,56"
- **THEN** el sistema normaliza el texto y guarda 25, 1.76 y 1234.56 respectivamente

#### Scenario: Mapeo ambiguo con clave combinada
- **WHEN** el mapeo incluye `articulo_medida_combinado` junto con `articulo_id`, `nombre`, `unidad_medida`, `medida` o `medida_id`
- **THEN** el sistema rechaza la petición con HTTP 422 sin procesar el archivo

#### Scenario: Alta por Excel con artículos existentes
- **WHEN** una línea del Excel corresponde a un artículo que ya existe
- **THEN** el sistema actualiza ese registro según las reglas de la lista de precios y responde HTTP 201

#### Scenario: Líneas repetidas del mismo artículo en el archivo
- **WHEN** el mismo artículo aparece en varias líneas del Excel para el mismo proveedor
- **THEN** el artículo se crea o reutiliza una sola vez y su registro queda con los datos (medida y precio) de la última línea

#### Scenario: Conflicto en una línea con rollback
- **WHEN** el valor de alguna línea no permite el insert (p.ej. precio negativo o artículo inválido)
- **THEN** el sistema revierte todo lo insertado y responde indicando la línea y columna del conflicto

#### Scenario: Proveedor nuevo inválido en alta por Excel
- **WHEN** el objeto proveedor sin `id` del header no puede darse de alta
- **THEN** el sistema rechaza la petición y no persiste ningún registro

### Requirement: Actualizar lista de precios

El sistema SHALL permitir actualizar un registro de lista de precios. Solo se
actualiza el `precio_lista`. El `id_articulo_proveedor` ya cargado puede usarse
como filtro validador de existencia del registro. El nuevo `precio_lista` debe
ser `>= 0`.

#### Scenario: Actualización exitosa
- **WHEN** se actualiza el `precio_lista` de un registro existente con un valor `>= 0`
- **THEN** el sistema actualiza el registro y responde HTTP 200 con el registro actualizado

#### Scenario: Actualización por id de artículo del proveedor
- **WHEN** se identifica un registro por su `id_articulo_proveedor` existente
- **THEN** el sistema actualiza el `precio_lista` de ese registro y responde HTTP 200

#### Scenario: Registro inexistente
- **WHEN** se intenta actualizar un registro que no existe o está eliminado
- **THEN** el sistema responde HTTP 404

#### Scenario: Precio de lista negativo al actualizar
- **WHEN** se envía un `precio_lista` menor que 0
- **THEN** el sistema rechaza la actualización con HTTP 422

### Requirement: Listar listas de precios con filtros

El sistema SHALL exponer un endpoint que devuelva los registros de lista de
precios no eliminados. Se puede filtrar por `categorias`, por `articulos` o por
`proveedor`. Si no se envía ningún filtro, se devuelven todas las listas de
precios existentes. El resultado usa paginación.

#### Scenario: Listado sin filtros
- **WHEN** se solicita el listado sin filtros
- **THEN** el sistema responde HTTP 200 con una lista paginada de todas las listas de precios no eliminadas

#### Scenario: Listado filtrado por proveedor
- **WHEN** se solicita el listado con un filtro de `proveedor`
- **THEN** el sistema responde HTTP 200 solo con los registros de ese proveedor

#### Scenario: Listado filtrado por categoría
- **WHEN** se solicita el listado con un filtro de `categorias`
- **THEN** el sistema responde HTTP 200 solo con los registros cuyos artículos pertenecen a esas categorías

#### Scenario: Listado filtrado por artículos
- **WHEN** se solicita el listado con un filtro de `articulos`
- **THEN** el sistema responde HTTP 200 solo con los registros de esos artículos

#### Scenario: Listado excluye registros eliminados
- **WHEN** se solicita el listado y existe un registro con `deleted_at` no nulo
- **THEN** el registro eliminado no aparece en la respuesta

### Requirement: Eliminar lista de precios (baja lógica)

El sistema SHALL permitir eliminar lógicamente un registro de lista de precios
seteando `deleted_at`; no elimina físicamente el registro. Si el registro no
existe, responde HTTP 404.

#### Scenario: Baja lógica de registro existente
- **WHEN** se solicita eliminar un registro existente
- **THEN** el sistema setea `deleted_at` y responde HTTP 204

#### Scenario: Baja de registro inexistente
- **WHEN** se solicita eliminar un registro que no existe
- **THEN** el sistema responde HTTP 404

### Requirement: Cantidad de registros por proveedor con desglose por categoría

El sistema SHALL exponer `GET /api/v1/listas-precios/cantidad-por-proveedor`,
que devuelve una lista ordenada por cantidad total descendente. Cada elemento
contiene el objeto `proveedor`, la `cantidad` de registros activos de ese
proveedor y un desglose `por_categoria` con la cantidad de registros por
categoría de artículo. Los registros con baja lógica no se consideran en
ninguno de los conteos.

#### Scenario: Respuesta con cantidad y desglose por categoría
- **WHEN** se solicita el conteo y existen registros para varios proveedores con distintas categorías
- **THEN** el sistema responde HTTP 200 con una lista donde cada elemento contiene `proveedor`, `cantidad` (suma de todos los registros activos del proveedor) y `por_categoria` (arreglo de `{categoria, cantidad}` por cada categoría usada)

#### Scenario: Proveedor con artículos sin categoría
- **WHEN** un proveedor tiene registros cuyos artículos carecen de categoría
- **THEN** esos registros suman a la `cantidad` del proveedor pero no aparecen en `por_categoria`

#### Scenario: El conteo excluye registros eliminados
- **WHEN** se solicita el conteo existiendo registros con `deleted_at` no nulo
- **THEN** los registros eliminados no suman a la cantidad ni a los conteos por categoría