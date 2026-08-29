## MODIFIED Requirements

### Requirement: Acciones por artículo
El sistema SHALL mostrar a la derecha de cada fila de la tabla de inventario una columna de acciones compuesta por tres botones solo-ícono (sin texto): editar, carrito (alta de venta) y eliminar. El botón de carrito SHALL estar habilitado y abrir el formulario de alta de venta para ese artículo, cuyo comportamiento se define en la capability `ventas`.

#### Scenario: Visualización de las acciones
- **WHEN** el usuario abre la sección de inventario
- **THEN** cada fila muestra a la derecha tres botones solo-ícono: editar, carrito (alta de venta) y eliminar

#### Scenario: Botones de íconos sin texto
- **WHEN** el usuario inspecciona la columna de acciones
- **THEN** los botones no contienen texto sino un ícono identificador

#### Scenario: Apertura del alta de venta
- **WHEN** el usuario hace clic en el botón de carrito de un artículo
- **THEN** el sistema abre el formulario de alta de venta para ese artículo
