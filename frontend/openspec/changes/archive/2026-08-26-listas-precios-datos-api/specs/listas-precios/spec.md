## MODIFIED Requirements

### Requirement: Encabezado y alta de lista
El sistema SHALL mostrar el título, la cantidad de ítems de listas de precios obtenida de la API y, para usuarios con rol ADMIN, dos botones de alta: "+ Nueva lista" (alta manual) y "Cargar Excel" (alta por archivo), que abren su formulario correspondiente.

#### Scenario: Visualización del encabezado
- **WHEN** el usuario abre la sección de listas de precios
- **THEN** el sistema muestra el título, la cantidad de ítems obtenida de la API y los botones de alta para rol ADMIN

#### Scenario: Botones de alta ocultos para no administradores
- **WHEN** el usuario no tiene rol ADMIN
- **THEN** el sistema no muestra los botones "+ Nueva lista" ni "Cargar Excel"

### Requirement: Estado vacío sin selección
El sistema SHALL mostrar un estado vacío con el mensaje "Seleccioná un proveedor para ver el detalle" cuando ningún proveedor está seleccionado.

#### Scenario: Sin proveedor seleccionado
- **WHEN** el usuario abre la sección sin haber seleccionado ningún proveedor
- **THEN** el sistema muestra el estado vacío con el mensaje correspondiente

## REMOVED Requirements

### Requirement: Selector de listas
**Reason**: La agrupación por tipo de cliente con multiplicador se reemplaza por la agrupación por proveedor que define docs/spec.md y que expone la API.
**Migration**: Usar el nuevo selector de proveedores (tarjetas por proveedor) y el detalle de ítems del proveedor.

### Requirement: Vista previa de la lista
**Reason**: La vista previa basada en multiplicador no existe en la API de listas de precios; el detalle ahora muestra los ítems reales del proveedor.
**Migration**: El detalle del proveedor seleccionado muestra Artículo, Medida y Precio de lista.

## ADDED Requirements

### Requirement: Selector de proveedores
El sistema SHALL obtener los proveedores con listas de precios desde el endpoint `cantidad-por-proveedor` (proveedor + cantidad de artículos) y mostrarlos como tarjetas seleccionables con el nombre del proveedor y esa cantidad; seleccionar una tarjeta la resalta y carga su detalle consultando los ítems filtrados por ese proveedor; seleccionarla nuevamente la deselecciona. El sistema SHALL paginar por proveedor de este modo para no traer todos los ítems de todas las listas al ingresar a la sección.

#### Scenario: Agrupación por proveedor
- **WHEN** el usuario abre la sección
- **THEN** el sistema muestra una tarjeta por proveedor devuelta por `cantidad-por-proveedor` con su nombre y la cantidad de artículos

#### Scenario: Selección de un proveedor
- **WHEN** el usuario selecciona una tarjeta de proveedor
- **THEN** el sistema la resalta y carga sus ítems con el filtro `proveedor_id`, mostrando el detalle

#### Scenario: Deselección de un proveedor
- **WHEN** el usuario selecciona nuevamente la tarjeta activa
- **THEN** el sistema la deselecciona y oculta el detalle

### Requirement: Detalle de lista del proveedor
El sistema SHALL mostrar, para el proveedor seleccionado, una tabla con Artículo, Medida y Precio de lista de sus ítems; para usuarios con rol ADMIN además muestra acciones de edición y baja por ítem.

#### Scenario: Detalle con precio de lista
- **WHEN** hay un proveedor seleccionado
- **THEN** el sistema muestra cada ítem con su artículo, medida y precio de lista

#### Scenario: Acciones de edición y baja
- **WHEN** el usuario tiene rol ADMIN
- **THEN** el sistema muestra en cada fila las acciones de edición y baja

### Requirement: Alta manual de lista de precios
El sistema SHALL permitir crear una lista de precios con un proveedor (existente o nuevo) y al menos un ítem con artículo, medida y precio de lista, y opcionalmente un código de artículo del proveedor. Cada ítem SHALL permitir seleccionar un artículo y una medida existentes o dar de alta uno nuevo sin salir del formulario: el artículo nuevo requiere nombre y categoría (y descripción opcional); la medida nueva requiere unidad de medida y medida. Los ítems agregados SHALL mostrarse como filas colapsadas con un resumen (artículo, medida y precio), con acciones de editar y eliminar, y solo uno de ellos SHALL permanecer expandido para edición a la vez. Si el proveedor no existe, o ya existe una lista para ese proveedor y artículo, el sistema muestra el error de la API y no cierra el formulario.

#### Scenario: Alta manual exitosa
- **WHEN** el usuario ADMIN completa el proveedor y los ítems y guarda
- **THEN** el sistema crea la lista de precios y la muestra en la agrupación por proveedor

#### Scenario: Error de API en el alta manual
- **WHEN** la API rechaza el alta (proveedor inválido, ítem duplicado para el proveedor u otro error)
- **THEN** el sistema muestra el mensaje de error de la API y mantiene el formulario abierto

#### Scenario: Alta inline de artículo nuevo
- **WHEN** el usuario en un ítem cambia el modo de artículo a "Nuevo", completa nombre y categoría y guarda
- **THEN** el sistema envía el artículo sin `id` (nombre, categoría y descripción opcional) y el backend lo crea junto con la lista

#### Scenario: Alta inline de medida nueva
- **WHEN** el usuario en un ítem cambia el modo de medida a "Nueva", completa unidad de medida y medida y guarda
- **THEN** el sistema envía la medida sin `id` (unidad de medida y medida) y el backend la crea junto con la lista

#### Scenario: Ítems colapsados con uno expandido
- **WHEN** el usuario agrega varios ítems al formulario
- **THEN** los ítems ya cargados se muestran colapsados con su resumen y solo el ítem que se está editando permanece expandido; editar otro colapsa el anterior

### Requirement: Alta por Excel de lista de precios
El sistema SHALL permitir cargar una lista de precios desde un archivo Excel, eligiendo primero el proveedor destino y mapeando las columnas del archivo a los campos de la lista. La selección del archivo SHALL hacerse mediante una zona de carga visible (dropzone clicable con indicador "+" que muestra el nombre del archivo elegido). Al seleccionar el archivo, el sistema SHALL detectar sus encabezados en el navegador y presentar el mapeo como un selector por campo con las columnas detectadas, mostrando la letra de columna (A, B, C…) junto al encabezado real; SHALL ofrecer un auto-mapeo con coincidencias típicas y SHALL validar en cliente las combinaciones requeridas antes de enviar (nombre o id de artículo; id de medida o unidad + medida; precio de lista obligatorio; o bien la columna única `articulo_medida_combinado`, que reemplaza artículo y medida y no puede combinarse con `articulo_id`, `nombre`, `unidad_medida`, `medida` ni `medida_id`). Si el archivo no es válido o el mapeo no es soportado, el sistema muestra el error de la API y no crea la lista.

#### Scenario: Carga por Excel exitosa
- **WHEN** el usuario ADMIN elige un proveedor, selecciona un archivo Excel válido con su mapeo y confirma
- **THEN** el sistema crea los ítems de la lista de precios para ese proveedor

#### Scenario: Archivo o mapeo inválido
- **WHEN** el archivo no se puede leer o el mapeo no es soportado
- **THEN** el sistema muestra el error de la API y no crea la lista

#### Scenario: Mapeo por columna detectada
- **WHEN** el usuario selecciona un archivo Excel
- **THEN** el sistema muestra las columnas detectadas (letra + encabezado) y cada campo se mapea eligiendo una de esas columnas

#### Scenario: Auto-mapeo sugerido
- **WHEN** el usuario selecciona un archivo Excel cuyos encabezados coinciden con nombres típicos (Nombre, Categoría, Unidad, Medida, Precio)
- **THEN** el sistema precarga el mapeo con esas coincidencias, que el usuario puede ajustar

#### Scenario: Validación previa bloquea el envío incompleto
- **WHEN** el usuario confirma sin archivo, sin mapeo o sin las combinaciones requeridas (artículo, medida completa y precio)
- **THEN** el sistema muestra el detalle de lo faltante y no envía la solicitud a la API

#### Scenario: Columna combinada de artículo y medida
- **WHEN** el usuario mapea una única columna a `articulo_medida_combinado` sin mapear `articulo_id`, `nombre`, `unidad_medida`, `medida` ni `medida_id`
- **THEN** el sistema acepta el mapeo como completo para artículo y medida y lo envía a la API

#### Scenario: Columna combinada incompatible con claves separadas
- **WHEN** el usuario mapea `articulo_medida_combinado` junto con alguna de `articulo_id`, `nombre`, `unidad_medida`, `medida` o `medida_id`
- **THEN** el sistema muestra el detalle del conflicto en cliente y no envía la solicitud a la API

### Requirement: Edición de precio de lista
El sistema SHALL permitir editar el precio de lista y el código de artículo del proveedor de un ítem. Si el ítem ya no existe, el sistema muestra el error de la API.

#### Scenario: Edición exitosa
- **WHEN** el usuario ADMIN modifica el precio de un ítem y guarda
- **THEN** el sistema actualiza el precio y lo refleja en el detalle

#### Scenario: Ítem inexistente
- **WHEN** el ítem fue eliminado por otro usuario
- **THEN** el sistema muestra el error de la API y actualiza el listado

### Requirement: Baja de lista de precios
El sistema SHALL permitir eliminar lógicamente un ítem de lista de precios con confirmación previa; tras la confirmación, el ítem deja de mostrarse en el detalle.

#### Scenario: Baja confirmada
- **WHEN** el usuario ADMIN confirma la eliminación de un ítem
- **THEN** el sistema elimina el ítem y deja de mostrarlo

#### Scenario: Baja cancelada
- **WHEN** el usuario ADMIN cancela la confirmación de eliminación
- **THEN** el sistema mantiene el ítem en el detalle

### Requirement: Filtros de listas de precios
El sistema SHALL permitir filtrar los ítems de listas de precios por proveedor y por categorías, y buscar por artículo mediante un buscador.

#### Scenario: Filtro por proveedor
- **WHEN** el usuario elige un proveedor en el filtro
- **THEN** el sistema muestra solo los ítems de ese proveedor

#### Scenario: Filtro por categorías
- **WHEN** el usuario elige una o más categorías
- **THEN** el sistema muestra solo los ítems de esas categorías

#### Scenario: Búsqueda por artículo
- **WHEN** el usuario escribe un término en el buscador
- **THEN** el sistema muestra solo los ítems cuyo artículo contiene el término
