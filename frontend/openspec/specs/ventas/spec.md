# Ventas Specification

## Purpose

Lista las ventas con filtros por estado y total acumulado de lo filtrado, en esta base con datos de ejemplo.

## Requirements

### Requirement: Encabezado con total filtrado
El sistema SHALL mostrar el título, el total de las ventas filtradas (sumando los totales reales devueltos por la API) y un botón "+ Nueva venta" destacado con el color secundario.

#### Scenario: Visualización del encabezado
- **WHEN** el usuario abre la sección de ventas
- **THEN** el sistema muestra el título, el total calculado sobre las ventas obtenidas de la API según el filtro activo y el botón de nueva venta

#### Scenario: Datos no disponibles
- **WHEN** el listado de ventas aún se está cargando o la API falla
- **THEN** el sistema muestra un estado de carga o un mensaje de error en lugar de una tabla vacía sin explicación

### Requirement: Filtro por estado
El sistema SHALL ofrecer píldoras de filtro por estado derivadas del campo `aprobado` de la API (Todas, Aprobadas, Pendientes) que filtran el listado y recalculan el total mostrado.

#### Scenario: Filtrar ventas por estado
- **WHEN** el usuario selecciona un estado en las píldoras
- **THEN** el sistema muestra solo las ventas con ese valor de `aprobado`, actualiza el total y resalta la píldora activa

### Requirement: Tabla de ventas
El sistema SHALL mostrar una tabla con los datos de `GET /api/v1/ventas`: número de venta, fecha, cliente (o guion si no tiene), cantidad de artículos, total, estado como desplegable editable en la columna Estado (Pendiente/Aprobada) y las acciones "Ver", "Editar" y "PDF" por fila.

#### Scenario: Visualización del listado
- **WHEN** la API devuelve las ventas con sus detalles agrupados
- **THEN** el sistema muestra una fila por venta con sus datos de cabecera sin volver a agrupar ni calcular en el cliente

#### Scenario: Edición del estado desde la fila
- **WHEN** el usuario cambia el valor del desplegable de estado de una fila (Pendiente ↔ Aprobada)
- **THEN** el sistema envía `PUT /api/v1/ventas/{id}` con el nuevo valor de `aprobado` y la fila refleja el estado elegido al refrescar el listado

### Requirement: Detalle de venta
El sistema SHALL mostrar al presionar "Ver" un modal con el detalle completo de la venta usando los detalles incluidos en la respuesta de la API: fecha, cliente, estado y, por cada ítem, artículo, medida, cantidad, precio unitario, subtotal y método de pago, más el total general de la venta.

#### Scenario: Apertura del detalle
- **WHEN** el usuario presiona "Ver" en una fila de venta
- **THEN** el sistema abre un modal con la cabecera de la venta y todos sus ítems con artículo, medida, cantidad, precio unitario, subtotal y método de pago, y el total general

#### Scenario: Cierre del detalle
- **WHEN** el usuario cierra el modal de detalle
- **THEN** el sistema vuelve al listado sin modificar los datos mostrados

### Requirement: Alta de venta desde la vista
El sistema SHALL permitir dar de alta una venta desde el botón "+ Nueva venta" con **uno o más artículos**, enviando `POST /api/v1/ventas` con al menos un ítem y un único tipo de pago para toda la venta. El sistema SHALL restringir el alta a artículos con stock disponible: solo se pueden seleccionar artículos con stock mayor a 0 y la cantidad de cada ítem no puede superar el stock disponible del artículo seleccionado.

#### Scenario: Formulario multi-artículo
- **WHEN** el usuario abre el formulario de nueva venta
- **THEN** el sistema permite cargar una o más filas de ítem (artículo + cantidad) y elegir un único tipo de pago que se aplica a toda la venta

#### Scenario: Selección de artículo con stock
- **WHEN** el usuario agrega un ítem al formulario
- **THEN** el sistema ofrece únicamente artículos de inventario con stock mayor a 0 e indica el stock disponible del artículo elegido

#### Scenario: Envío válido
- **WHEN** el usuario confirma con al menos un ítem, cantidades mayores a 0 y menores o iguales al stock disponible de cada artículo
- **THEN** el sistema envía la venta a la API, cierra el modal al éxito y refresca el listado de ventas y el stock de inventario

#### Scenario: Cantidad que supera el stock
- **WHEN** el usuario ingresa en un ítem una cantidad mayor al stock disponible del artículo seleccionado
- **THEN** el sistema impide enviar el formulario y muestra un mensaje indicando el stock máximo disponible

#### Scenario: Error de stock reportado por la API
- **WHEN** la API rechaza el alta por stock insuficiente u otro error
- **THEN** el sistema muestra el mensaje de error dentro del modal sin cerrarlo

### Requirement: Edición de ventas y gestión del estado
El sistema SHALL ofrecer la acción "Editar" en todas las filas, que abre un modal donde la venta se edita como conjunto de filas artículo + cantidad: los ítems existentes son editables (cambiar artículo, modificar cantidad, quitar), se pueden agregar ítems nuevos, se elige un único tipo de pago para toda la venta y el cliente es editable. La confirmación SHALL enviar `PUT /api/v1/ventas/{id}` con el set completo de ítems resultante. El cambio de estado desde el desplegable SHALL enviar `PUT /api/v1/ventas/{id}` con el nuevo valor de `aprobado`. La acción "Cancelar" SHALL permanecer solo en ventas Pendiente, pedir confirmación y enviar `DELETE /api/v1/ventas/{id}` (borrado lógico). En la edición, la validación de stock SHALL considerar el stock que el backend restaura de los ítems actuales de la venta (stock actual más la cantidad original del artículo en la venta).

#### Scenario: Editar ítems de una venta
- **WHEN** el usuario modifica cantidades, cambia artículos, quita o agrega ítems en el modal "Editar" y confirma con al menos un ítem válido
- **THEN** el sistema envía a la API el set completo resultante y, al éxito, refresca el listado mostrando la venta con su total recalculado

#### Scenario: Tipo de pago único en la edición
- **WHEN** el usuario confirma la edición de una venta
- **THEN** todos los ítems del payload llevan el tipo de pago elegido en el modal (precargado con el método del primer ítem existente)

#### Scenario: Stock disponible al editar
- **WHEN** el usuario aumenta la cantidad de un ítem que ya forma parte de la venta
- **THEN** el sistema valida contra el stock actual más la cantidad original de ese artículo en la venta, porque el backend restaura el stock actual antes de descontar el nuevo set

#### Scenario: Cancelar una venta pendiente
- **WHEN** el usuario confirma la acción "Cancelar" sobre una venta pendiente
- **THEN** el sistema envía el borrado lógico a la API y la venta deja de aparecer en el listado

#### Scenario: Error en edición o cambio de estado
- **WHEN** la API rechaza una edición, un cambio de estado o un borrado (por ejemplo, stock insuficiente o sin permiso)
- **THEN** el sistema muestra el mensaje de error sin perder el estado actual del listado ni cerrar el modal de edición

### Requirement: Alta de venta desde inventario
El sistema SHALL permitir dar de alta una venta desde la vista de inventario: al hacer clic en el botón de carrito de un artículo se abre un formulario que pide una cantidad vendida (obligatoria), un nombre de cliente (opcional), un tipo de pago seleccionable mediante un desplegable buscable con los métodos de pago obtenidos de la API y un check "Venta aprobada" activo por defecto. Al confirmar, el sistema SHALL enviar `POST /api/v1/ventas` con un `items` que contenga el `inventario_id` del artículo, la `cantidad` y el `metodo_pago_id` del método elegido (si se eligió uno), `aprobado` según el check, `cliente` si se ingresó y `presupuesto_id: null`. Ante stock insuficiente u otro error de la API, el sistema SHALL mostrar el mensaje de error y mantener el formulario abierto; ante el éxito, SHALL refrescar el listado de inventario.

#### Scenario: Despliegue del formulario
- **WHEN** el usuario hace clic en el botón de carrito de un artículo
- **THEN** el sistema abre un formulario con cantidad vendida, nombre de cliente, tipo de pago y el check "Venta aprobada"

#### Scenario: Cantidad obligatoria
- **WHEN** el usuario intenta confirmar el alta sin cantidad vendida o con cantidad menor o igual a cero
- **THEN** el sistema muestra una validación y no envía la solicitud

#### Scenario: Búsqueda del tipo de pago
- **WHEN** el usuario escribe un término en el desplegable de tipo de pago
- **THEN** el sistema muestra únicamente los métodos de pago cuyo nombre contiene el término

#### Scenario: Venta aprobada activa por defecto
- **WHEN** el usuario abre el formulario
- **THEN** el check "Venta aprobada" está activo y la venta se envía con `aprobado: true` salvo que el usuario lo desactive

#### Scenario: Envío sin presupuesto
- **WHEN** el usuario confirma el alta
- **THEN** el sistema envía `presupuesto_id: null`

#### Scenario: Alta exitosa
- **WHEN** el usuario completa datos válidos y confirma
- **THEN** el sistema envía `POST /api/v1/ventas`, el backend descuenta el stock y el sistema refresca el listado de inventario

#### Scenario: Stock insuficiente
- **WHEN** la cantidad vendida supera el stock disponible
- **THEN** el sistema muestra el error de la API y mantiene el formulario abierto

#### Scenario: Cancelar el alta
- **WHEN** el usuario hace clic en Cancelar
- **THEN** el sistema cierra el formulario sin enviar ninguna solicitud
