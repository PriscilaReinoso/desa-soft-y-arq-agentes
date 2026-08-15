## MODIFIED Requirements

### Requirement: Tabla de artículos
El sistema SHALL mostrar una tabla con las columnas Categoría, Artículo, Medida, Stock, Mínimo, Ubicación y P. Venta y una acción Editar. Los artículos con stock menor a su stock mínimo SHALL marcarse con la insignia "Bajo stock" y su stock en color de alerta. El precio de venta SHALL mostrarse con la unidad de venta como sufijo (p. ej. "$140 / metro") cuando el ítem tiene una medida de venta asignada. La acción Editar SHALL abrir un modal que permite modificar el nombre, la descripción y la categoría del artículo vinculado, la medida del ítem, y los campos espacio, ubicación, stock, stock mínimo, precio de venta y medida de venta.

#### Scenario: Marcado de stock bajo
- **WHEN** un artículo tiene stock menor a su mínimo
- **THEN** el sistema muestra la insignia "Bajo stock" y el stock en color de alerta

#### Scenario: Precio con unidad de venta
- **WHEN** un artículo tiene una medida de venta asignada
- **THEN** el sistema muestra el precio de venta con el sufijo de esa unidad

#### Scenario: Edición del artículo vinculado
- **WHEN** el usuario modifica el nombre, la descripción o la categoría del artículo desde el modal de edición
- **THEN** el sistema persiste los cambios en el artículo y refresca el listado con los nuevos valores

#### Scenario: Edición de la medida del ítem
- **WHEN** el usuario cambia la medida del ítem desde el modal de edición
- **THEN** el sistema persiste el cambio y actualiza la fila con la nueva medida

## ADDED Requirements

### Requirement: Búsqueda de medidas en los formularios
El sistema SHALL permitir buscar las medidas disponibles al seleccionar "Medida" o "Medida de venta" en el formulario de alta y en el modal de edición, mediante un campo de texto que filtra las medidas por coincidencia parcial en la unidad o el valor de la medida.

#### Scenario: Búsqueda de una medida
- **WHEN** el usuario escribe un término en el selector buscable de medida
- **THEN** el sistema muestra únicamente las medidas cuya unidad o valor contienen el término

#### Scenario: Sin resultados en la búsqueda
- **WHEN** el término de búsqueda no coincide con ninguna medida
- **THEN** el sistema muestra un estado "sin resultados" y no permite confirmar esa selección
