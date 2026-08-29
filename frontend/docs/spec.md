# Casos de uso

## Vista inventario - Realizado

- modificar la vista de inventario existentes para que utilize la informacion de la API y no la mock. Los valores a mostrar son: Categoría - Artículo - Medida - Stock - Ubicacion (espacio, fila, columna y deposito) - P. Venta
- modificar el boton + nuevo articulo para que utilice alta de inventario de la API. Modifica los parametros a los definidos en el swagger como necesarios.

## Vista de inico

- Modifica la vista de inicio para mostar informacion real obtenida de la API.
- En la API todavia no estan los metodos relacionados a ventas por lo que dejar sin informacion en esos casos

## Vista de depositos

- modifica la vista de depositos existente para que utilice la informacion de la API y no la mock.
- Se debe poder dar de alta nuevos depositos y editar existentes

## Modificacion/Baja en Vista inventario

- Se debe poder tener un boton de editar por articulo para poder actualizarlo. Este boton debe abrir un modal para poder editar la informacion del articulo. Y dejar un boton para añadir a preventa que sera futura disponibilidad
- Se debe poder tener un boton de eliminar por articulo para poder eliminarlo.
- Los botones no deben contener texto, sino un logo identificadorio, deben estar ubicados a la derecha del articulo.

## Vista de proveedores

- modifica la vista de proveedores existente para que utilice la informacion de la API y no la mock.
- Se debe poder dar de alta nuevos depositos y editar existentes, se puede agregar o quitar categorias de un proveedor

## Vista de lista de precios

- modifica la vista de lista precios existente para que utilice la informacion de la API y no la mock.
- La agrupacion de lista de precios debe ser por proveedor y no como el mock que es por cliente.
- Cuando se seleccione un proveedor se debe poder visualizar los articulos, medida y sus precios de listas
- el alta se puede hacer manual con la carga de un formulario o con la carga de excel, agrega un boton para cada caso
- el alta desde el excel debe permitir elegir al proveedor al que le hara esa carga de lista de precios.
- Ademas de poder filtrar por proveedor, agregar filtro por categorias y un buscador para filtrar por articulo

## alta de venta desde inventario

- dentro de inventario al tocar el boton de carrito del un articulo daria de alta una venta utilizando la api.
- deberia abrir un form para pedirme una cantidad vendida del articulo (obligatorio), un nombre de cliente (no obligatorio), un tipo de pago (deberia ser un deslegable con los metodos de pago, que me permita buscar) y un check (por defecto que este activo) para enviar aprobado: true, el check debe llamarse venta aprobada.
- al llamar a la api debe enviar presupuesto null

## Vista de ventas

- modifica la vista de ventas existente para que utilice la informacion de la API (y no la mock.)
- La agrupacion de ventas ya es devuelta por la API
- Cuando se seleccione ver deberia poder ver el detalle completo de la venta
- el alta de ventas solo puede hacerse con articulos en stock y no vender mas del stock