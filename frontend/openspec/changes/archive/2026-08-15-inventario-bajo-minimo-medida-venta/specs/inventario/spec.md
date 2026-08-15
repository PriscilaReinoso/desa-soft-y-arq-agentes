## MODIFIED Requirements

### Requirement: Encabezado y alta de artículo
El sistema SHALL mostrar el título, la cantidad de artículos registrados y un botón "+ Nuevo artículo" que despliega un formulario inline con los campos Artículo (existente o nuevo con nombre y categoría), Medida (existente o nueva), Espacio (opcional: ninguno, existente o nuevo con depósito), Fila, Columna, Stock, Stock mínimo, Precio de venta y Medida de venta (opcional, seleccionable entre las medidas existentes), con acciones Guardar y Cancelar. El campo Stock mínimo SHALL aceptar un valor entero mayor o igual a 0. La medida de venta SHALL clasificar el precio de venta por unidad o por medida; no se crea una medida de venta nueva y, si se elige, se envía su identificador de medida existente.

#### Scenario: Despliegue del formulario
- **WHEN** el usuario hace clic en "+ Nuevo artículo"
- **THEN** el sistema muestra el formulario de alta inline con sus campos y botones Guardar y Cancelar

#### Scenario: Cancelar el alta
- **WHEN** el usuario hace clic en Cancelar
- **THEN** el sistema oculta el formulario sin crear ningún artículo

#### Scenario: Alta con stock mínimo y medida de venta
- **WHEN** el usuario carga un Stock mínimo y selecciona una medida de venta existente y confirma el alta
- **THEN** el sistema crea el ítem con esos valores (mínimo y medida de venta) y refresca el listado

#### Scenario: Alta sin medida de venta
- **WHEN** el usuario no selecciona una medida de venta
- **THEN** el sistema crea el ítem sin medida de venta

### Requirement: Tabla de artículos
El sistema SHALL mostrar una tabla con las columnas Categoría, Artículo, Medida, Stock, Mínimo, Ubicación y P. Venta y una acción Editar. Los artículos con stock menor a su stock mínimo SHALL marcarse con la insignia "Bajo stock" y su stock en color de alerta. El precio de venta SHALL mostrarse con la unidad de venta como sufijo (p. ej. "$140 / metro") cuando el ítem tiene una medida de venta asignada.

#### Scenario: Marcado de stock bajo
- **WHEN** un artículo tiene stock menor a su mínimo
- **THEN** el sistema muestra la insignia "Bajo stock" y el stock en color de alerta

#### Scenario: Precio con unidad de venta
- **WHEN** un artículo tiene una medida de venta asignada
- **THEN** el sistema muestra el precio de venta con el sufijo de esa unidad

#### Scenario: Precio sin unidad de venta
- **WHEN** un artículo no tiene medida de venta
- **THEN** el sistema muestra el precio de venta sin sufijo
