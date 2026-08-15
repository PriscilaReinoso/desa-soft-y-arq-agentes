# Inventario Specification

## Purpose

Gestiona el listado de artículos con búsqueda, filtros por categoría y alta inline, en esta base con datos de ejemplo.

## Requirements

### Requirement: Encabezado y alta de artículo
El sistema SHALL mostrar el título, la cantidad de artículos registrados (obtenida de la API) y un botón "+ Nuevo artículo" que despliega un formulario de alta que envía un `POST /api/v1/inventarios/alta` con los parámetros definidos en el swagger. El formulario SHALL permitir seleccionar un artículo, una medida y un espacio existentes (cargados desde la API) o crearlos en línea: artículo nuevo requiere nombre y categoría; medida nueva requiere unidad y valor de medida; espacio nuevo requiere depósito. El espacio SHALL ser opcional (ninguno, existente o nuevo). Además SHALL permitir ingresar Fila, Columna, Stock, Stock mínimo, Precio de venta y Medida de venta (opcional, seleccionable entre las medidas existentes), con acciones Guardar y Cancelar. El campo Stock mínimo SHALL aceptar un valor entero mayor o igual a 0. La medida de venta SHALL clasificar el precio de venta por unidad o por medida; no se crea una medida de venta nueva y, si se elige, se envía su identificador de medida existente. Ante el éxito, el sistema SHALL refrescar el listado con el nuevo registro.

#### Scenario: Despliegue del formulario
- **WHEN** el usuario hace clic en "+ Nuevo artículo"
- **THEN** el sistema muestra el formulario de alta inline con sus campos y botones Guardar y Cancelar

#### Scenario: Cancelar el alta
- **WHEN** el usuario hace clic en Cancelar
- **THEN** el sistema oculta el formulario sin crear ningún artículo

#### Scenario: Alta exitosa
- **WHEN** el usuario completa el formulario con datos válidos y confirma Guardar
- **THEN** el sistema envía `POST /api/v1/inventarios/alta` y actualiza el listado con el registro creado

#### Scenario: Alta de artículo nuevo
- **WHEN** el usuario crea un artículo nuevo sin seleccionar uno existente
- **THEN** el sistema envía el alta con `articulo.nombre` y `articulo.categoria_id`

#### Scenario: Alta con stock mínimo y medida de venta
- **WHEN** el usuario carga un Stock mínimo y selecciona una medida de venta existente y confirma el alta
- **THEN** el sistema crea el ítem con esos valores (mínimo y medida de venta) y refresca el listado

#### Scenario: Alta sin medida de venta
- **WHEN** el usuario no selecciona una medida de venta
- **THEN** el sistema crea el ítem sin medida de venta

### Requirement: Datos del inventario desde la API
El sistema SHALL cargar el listado de inventario desde `GET /api/v1/inventarios` sin utilizar datos mock. El backend SHALL devolver los nombres ya resueltos de forma embebida (`articulo` con su `categoria`, `medida`, `espacio` con su `deposito`), por lo que el frontend SHALL mapear esa respuesta directamente a las filas de la tabla. Mientras carga, SHALL mostrar un estado de carga; ante un error de la API SHALL mostrar un mensaje de error; y ante una sesión no autorizada SHALL redirigir al login.

#### Scenario: Carga del listado
- **WHEN** el usuario abre la sección de inventario
- **THEN** el sistema muestra el listado cargado desde la API con los nombres resueltos

#### Scenario: Error de la API
- **WHEN** la API responde con un error al cargar el inventario
- **THEN** el sistema muestra un mensaje de error en lugar del listado

#### Scenario: Sesión no autorizada
- **WHEN** la API responde 401 al consultar el inventario
- **THEN** el sistema limpia la sesión y redirige a la pantalla de login

### Requirement: Búsqueda de artículos
El sistema SHALL permitir filtrar los artículos escribiendo en un campo de búsqueda que coincide con el nombre del artículo o su categoría.

#### Scenario: Búsqueda de artículos
- **WHEN** el usuario escribe un término en el campo de búsqueda
- **THEN** el sistema muestra únicamente los artículos cuyo nombre o categoría contienen el término

### Requirement: Filtros por categoría
El sistema SHALL mostrar filtros de categoría como píldoras seleccionables con estado activo, incluida la opción "Todos".

#### Scenario: Filtrar por categoría
- **WHEN** el usuario selecciona una píldora de categoría
- **THEN** el sistema muestra solo los artículos de esa categoría y resalta la píldora seleccionada

#### Scenario: Filtro combinado con búsqueda
- **WHEN** el usuario combina una categoría seleccionada con un término de búsqueda
- **THEN** el sistema muestra los artículos que cumplen ambas condiciones

### Requirement: Tabla de artículos
El sistema SHALL mostrar una tabla con las columnas Categoría, Artículo, Medida, Stock, Mínimo, Ubicación y P. Venta y una acción Editar. La medida SHALL componerse de su unidad y valor (ej. "pulgada 1/2"); la ubicación SHALL mostrarse como depósito, espacio, fila y columna cuando estén definidos, indicando que el artículo no tiene ubicación asignada en caso contrario. Los artículos con stock menor a su stock mínimo SHALL marcarse con la insignia "Bajo stock" y su stock en color de alerta. El precio de venta SHALL mostrarse con la unidad de venta como sufijo (p. ej. "$140 / metro") cuando el ítem tiene una medida de venta asignada. La acción Editar SHALL abrir un modal que permite modificar el nombre, la descripción y la categoría del artículo vinculado, la medida del ítem, y los campos espacio, ubicación, stock, stock mínimo, precio de venta y medida de venta.

#### Scenario: Medida compuesta
- **WHEN** un registro tiene medida con unidad y valor
- **THEN** el sistema muestra la medida como la combinación de ambos

#### Scenario: Ubicación completa
- **WHEN** un registro tiene depósito, espacio, fila y columna
- **THEN** el sistema muestra la ubicación con esos cuatro datos

#### Scenario: Sin ubicación asignada
- **WHEN** un registro no tiene espacio asignado
- **THEN** el sistema lo indica en la columna de ubicación

#### Scenario: Marcado de stock bajo
- **WHEN** un artículo tiene stock menor a su mínimo
- **THEN** el sistema muestra la insignia "Bajo stock" y el stock en color de alerta

#### Scenario: Precio con unidad de venta
- **WHEN** un artículo tiene una medida de venta asignada
- **THEN** el sistema muestra el precio de venta con el sufijo de esa unidad

#### Scenario: Precio sin unidad de venta
- **WHEN** un artículo no tiene medida de venta
- **THEN** el sistema muestra el precio de venta sin sufijo

#### Scenario: Edición del artículo vinculado
- **WHEN** el usuario modifica el nombre, la descripción o la categoría del artículo desde el modal de edición
- **THEN** el sistema persiste los cambios en el artículo y refresca el listado con los nuevos valores

#### Scenario: Edición de la medida del ítem
- **WHEN** el usuario cambia la medida del ítem desde el modal de edición
- **THEN** el sistema persiste el cambio y actualiza la fila con la nueva medida

### Requirement: Acciones por artículo
El sistema SHALL mostrar a la derecha de cada fila de la tabla de inventario una columna de acciones compuesta por tres botones solo-ícono (sin texto): editar, añadir a preventa y eliminar. El botón de añadir a preventa SHALL estar deshabilitado con la indicación de que será disponibilidad futura.

#### Scenario: Visualización de las acciones
- **WHEN** el usuario abre la sección de inventario
- **THEN** cada fila muestra a la derecha tres botones solo-ícono: editar, añadir a preventa (deshabilitado) y eliminar

#### Scenario: Botones de íconos sin texto
- **WHEN** el usuario inspecciona la columna de acciones
- **THEN** los botones no contienen texto sino un ícono identificador

### Requirement: Edición de un artículo
El sistema SHALL abrir un modal precargado con los datos del registro al hacer clic en el botón de editar, permitiendo actualizar el artículo vinculado (nombre, descripción y categoría), la medida del ítem, el espacio, la fila, la columna, el stock, el stock mínimo y el precio de venta. Al confirmar, el sistema SHALL enviar `PUT /api/v1/inventarios/{id}` y refrescar el listado.

#### Scenario: Despliegue del modal de edición
- **WHEN** el usuario hace clic en el ícono de editar de un artículo
- **THEN** el sistema muestra un modal precargado con espacio, fila, columna, stock y precio de venta del registro

#### Scenario: Edición exitosa
- **WHEN** el usuario modifica los campos y confirma
- **THEN** el sistema envía `PUT /api/v1/inventarios/{id}` y actualiza el listado con el registro modificado

#### Scenario: Cancelar la edición
- **WHEN** el usuario hace clic en Cancelar en el modal de edición
- **THEN** el sistema cierra el modal sin enviar ninguna solicitud

### Requirement: Baja de un artículo
El sistema SHALL pedir confirmación antes de eliminar un artículo y, al confirmar, enviar `DELETE /api/v1/inventarios/{id}` y refrescar el listado. Ante un error de la API, el sistema SHALL mostrar el detalle del error.

#### Scenario: Baja con confirmación
- **WHEN** el usuario hace clic en el ícono de eliminar y confirma la eliminación
- **THEN** el sistema envía `DELETE /api/v1/inventarios/{id}` y quita el artículo del listado

#### Scenario: Cancelar la baja
- **WHEN** el usuario hace clic en el ícono de eliminar y cancela la confirmación
- **THEN** el sistema no envía ninguna solicitud y mantiene el artículo en el listado

#### Scenario: Error al eliminar
- **WHEN** la API responde con un error al eliminar el artículo
- **THEN** el sistema muestra un mensaje de error con el detalle de la respuesta

### Requirement: Búsqueda de medidas en los formularios
El sistema SHALL permitir buscar las medidas disponibles al seleccionar "Medida" o "Medida de venta" en el formulario de alta y en el modal de edición, mediante un campo de texto que filtra las medidas por coincidencia parcial en la unidad o el valor de la medida.

#### Scenario: Búsqueda de una medida
- **WHEN** el usuario escribe un término en el selector buscable de medida
- **THEN** el sistema muestra únicamente las medidas cuya unidad o valor contienen el término

#### Scenario: Sin resultados en la búsqueda
- **WHEN** el término de búsqueda no coincide con ninguna medida
- **THEN** el sistema muestra un estado "sin resultados" y no permite confirmar esa selección
