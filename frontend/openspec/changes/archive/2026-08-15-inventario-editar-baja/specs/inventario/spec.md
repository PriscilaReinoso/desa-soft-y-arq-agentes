## ADDED Requirements

### Requirement: Acciones por artículo
El sistema SHALL mostrar a la derecha de cada fila de la tabla de inventario una columna de acciones compuesta por tres botones solo-ícono (sin texto): editar, añadir a preventa y eliminar. El botón de añadir a preventa SHALL estar deshabilitado con la indicación de que será disponibilidad futura.

#### Scenario: Visualización de las acciones
- **WHEN** el usuario abre la sección de inventario
- **THEN** cada fila muestra a la derecha tres botones solo-ícono: editar, añadir a preventa (deshabilitado) y eliminar

#### Scenario: Botones de íconos sin texto
- **WHEN** el usuario inspecciona la columna de acciones
- **THEN** los botones no contienen texto sino un ícono identificador

### Requirement: Edición de un artículo
El sistema SHALL abrir un modal precargado con los datos del registro al hacer clic en el botón de editar, permitiendo actualizar el espacio, la fila, la columna, el stock y el precio de venta. Al confirmar, el sistema SHALL enviar `PUT /api/v1/inventarios/{id}` y refrescar el listado. El artículo y la medida no SHALL ser editables en este modal.

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
