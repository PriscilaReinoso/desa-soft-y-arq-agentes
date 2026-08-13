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