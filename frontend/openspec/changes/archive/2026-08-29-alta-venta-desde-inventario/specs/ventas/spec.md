## ADDED Requirements

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
