## MODIFIED Requirements

### Requirement: Encabezado y alta de artículo
El sistema SHALL mostrar el título, la cantidad de artículos registrados (obtenida de la API) y un botón "+ Nuevo artículo" que despliega un formulario de alta que envía un `POST /api/v1/inventarios/alta` con los parámetros definidos en el swagger. El formulario SHALL permitir seleccionar un artículo, una medida y un espacio existentes (cargados desde la API) o crearlos en línea: artículo nuevo requiere nombre y categoría; medida nueva requiere unidad y valor de medida; espacio nuevo requiere depósito. Además SHALL permitir ingresar fila, columna, stock y precio de venta, con acciones Guardar y Cancelar. Ante el éxito, el sistema SHALL refrescar el listado con el nuevo registro.

#### Scenario: Despliegue del formulario
- **WHEN** el usuario hace clic en "+ Nuevo artículo"
- **THEN** el sistema muestra el formulario de alta con los selectores de artículo, medida y espacio y los campos fila, columna, stock y precio de venta

#### Scenario: Cancelar el alta
- **WHEN** el usuario hace clic en Cancelar
- **THEN** el sistema oculta el formulario sin enviar ninguna solicitud

#### Scenario: Alta exitosa
- **WHEN** el usuario completa el formulario con datos válidos y confirma Guardar
- **THEN** el sistema envía `POST /api/v1/inventarios/alta` y actualiza el listado con el registro creado

#### Scenario: Alta de artículo nuevo
- **WHEN** el usuario crea un artículo nuevo sin seleccionar uno existente
- **THEN** el sistema envía el alta con `articulo.nombre` y `articulo.categoria_id`

### Requirement: Búsqueda de artículos
El sistema SHALL permitir filtrar los artículos escribiendo en un campo de búsqueda que coincide con el nombre del artículo o su categoría.

#### Scenario: Búsqueda de artículos
- **WHEN** el usuario escribe un término en el campo de búsqueda
- **THEN** el sistema muestra únicamente los artículos cuyo nombre o categoría contienen el término

### Requirement: Tabla de artículos
El sistema SHALL mostrar una tabla con las columnas Categoría, Artículo, Medida, Stock, Ubicación (espacio, fila, columna y depósito) y P. Venta. La medida SHALL componerse de su unidad y valor (ej. "pulgada 1/2"); la ubicación SHALL mostrarse como depósito, espacio, fila y columna cuando estén definidos, indicando que el artículo no tiene ubicación asignada en caso contrario.

#### Scenario: Medida compuesta
- **WHEN** un registro tiene medida con unidad y valor
- **THEN** el sistema muestra la medida como la combinación de ambos

#### Scenario: Ubicación completa
- **WHEN** un registro tiene depósito, espacio, fila y columna
- **THEN** el sistema muestra la ubicación con esos cuatro datos

#### Scenario: Sin ubicación asignada
- **WHEN** un registro no tiene espacio asignado
- **THEN** el sistema lo indica en la columna de ubicación

## ADDED Requirements

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
