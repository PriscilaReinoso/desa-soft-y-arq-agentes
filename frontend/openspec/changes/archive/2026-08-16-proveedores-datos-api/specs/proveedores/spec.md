## MODIFIED Requirements

### Requirement: Encabezado y alta de proveedor
El sistema SHALL mostrar el título, la cantidad de proveedores registrados obtenidos de la API y, para usuarios con rol ADMIN, un botón "+ Nuevo proveedor" que abre el formulario de alta.

#### Scenario: Visualización del encabezado
- **WHEN** el usuario abre la sección de proveedores
- **THEN** el sistema muestra el título, la cantidad de proveedores obtenida de la API y el botón de alta

#### Scenario: Botón de alta oculto para no administradores
- **WHEN** el usuario no tiene rol ADMIN
- **THEN** el sistema no muestra el botón "+ Nuevo proveedor"

### Requirement: Búsqueda de proveedores
El sistema SHALL permitir buscar proveedores por nombre, apellido o teléfono.

#### Scenario: Búsqueda por nombre, apellido o teléfono
- **WHEN** el usuario escribe un término en el campo de búsqueda
- **THEN** el sistema muestra únicamente los proveedores cuyo nombre, apellido o teléfono contienen el término

### Requirement: Tarjetas de proveedor
El sistema SHALL mostrar cada proveedor en una tarjeta con avatar de iniciales, nombre y apellido, teléfono, dirección y categorías como etiquetas, obtenidos de la API; para usuarios ADMIN además muestra las acciones "Editar" y "Eliminar".

#### Scenario: Avatar de iniciales
- **WHEN** un proveedor tiene nombre y apellido
- **THEN** el sistema muestra su avatar con las iniciales de su nombre

#### Scenario: Acciones de edición y baja
- **WHEN** el usuario tiene rol ADMIN
- **THEN** el sistema muestra en cada tarjeta las acciones "Editar" y "Eliminar"

## ADDED Requirements

### Requirement: Alta de proveedor
El sistema SHALL permitir crear un proveedor con nombre, apellido y teléfono requeridos, dirección opcional y categorías opcionales, enviando los ids de categoría seleccionados. Si el proveedor ya existe (mismo teléfono o mismo nombre y apellido) o una categoría es inválida, el sistema muestra el error de la API.

#### Scenario: Alta exitosa
- **WHEN** el usuario ADMIN completa nombre, apellido y teléfono y guarda
- **THEN** el sistema crea el proveedor, lo agrega al listado y cierra el formulario

#### Scenario: Alta sin categorías
- **WHEN** el usuario ADMIN crea un proveedor sin seleccionar categorías
- **THEN** el sistema crea el proveedor sin categorías asociadas

#### Scenario: Alta de proveedor duplicado
- **WHEN** el usuario ADMIN intenta crear un proveedor cuyo teléfono o nombre y apellido ya existen
- **THEN** el sistema muestra el mensaje de error de la API y no cierra el formulario

#### Scenario: Categoría inexistente
- **WHEN** el usuario ADMIN envía una categoría que no existe
- **THEN** el sistema muestra el mensaje de error de la API y no crea el proveedor

### Requirement: Edición de proveedor
El sistema SHALL permitir editar nombre, apellido, teléfono, dirección y las categorías de un proveedor; las categorías se cargan preseleccionadas y el guardado envía el set completo de categorías seleccionadas, permitiendo agregar o quitar.

#### Scenario: Edición exitosa
- **WHEN** el usuario ADMIN modifica los datos de un proveedor y guarda
- **THEN** el sistema actualiza el proveedor y refleja los cambios en el listado

#### Scenario: Agregar o quitar categorías
- **WHEN** el usuario ADMIN cambia la selección de categorías de un proveedor y guarda
- **THEN** el sistema reemplaza las categorías del proveedor por las seleccionadas

### Requirement: Baja de proveedor
El sistema SHALL permitir eliminar lógicamente un proveedor con confirmación previa; tras la confirmación, el sistema llama a la baja de la API y el proveedor deja de mostrarse en el listado.

#### Scenario: Baja confirmada
- **WHEN** el usuario ADMIN confirma la eliminación de un proveedor
- **THEN** el sistema elimina el proveedor y deja de mostrarlo en el listado

#### Scenario: Baja cancelada
- **WHEN** el usuario ADMIN cancela la confirmación de eliminación
- **THEN** el sistema mantiene el proveedor en el listado
