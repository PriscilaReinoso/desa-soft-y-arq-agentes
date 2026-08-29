# Logica de negocio

## Información General

- Proyecto: Sistema de Gestión de Inventario para Ferretería
- Descripcion: Se requiere gestionar el inventario de articulos para la venta, es necesario conocer su stock y espacio fisicos.

## Convenciones

- PK UUID en todas las tablas (`id`), salvo tablas puente si se decide PK compuesta.
- Todas las tablas incluyen: `created_at`, `updated_at`, `deleted_at`.
- Fechas en UTC-3.
- snake_case para tablas y columnas.
- FK terminan en `_id`.

---

# Casos de Uso

## CRUDs Articulos

Descripcion:
- Requiere poder dar de alta/leer/actualizar y borrar de forma logica articulos nuevos.

## CRUDs medida

Descripcion:
- Requiere poder dar de alta/leer/actualizar y borrar de forma logica nuevas medidas.

## CRUDs deposito

Descripcion:
- Requiere poder dar de alta/leer/actualizar y borrar de forma logica nuevos depositos.

## CRUDs espacio

Descripcion:
- Requiere poder dar de alta/leer/actualizar y borrar de forma logica nuevos espacio. Un espacio se refiere un estanteria, muestrerio, etc, un espacio es donde se depositan varios articulos por eso tiene un maximo de filas y columnas de lugares para almacenar. Un espacio tiene que estar en un deposito, un deposito puede tener 0 o muchos espacios.

## CRUDs inventario

Descripcion:
- Requiere poder dar de alta/leer/actualizar y borrar de forma logica nuevos inventarios. Inventarios es la union de toda la informacion de consulta sobre productos a la venta, en inventario se asociara un articulo, con su medida, stock y precio de venta, ademas de su espacio dentro del deposito. Como reglas fila y columna siempre deben ser >=0 para definir el lugar del espacio en el que se encuentra. Como regla el precio venta tiene que ser >=0. Como regla el stock (cantidad de articulos disponibles para la venta) tiene que ser >=0. Como regla en inventario podria no tener un espacio asignado, si y solo si el stock = 0, en ese caso a nivel base de datos espacio_id=null.

## Alta de inventario, articulo, medida y espacio

Descripcion:
- Requiere poder dar de alta in inventario recbiendo un articulo nuevo (sin id, debera darlo de alta) o existente (con id), una medida nueva (sin id, debera darla de alta) o existente (con id), la combacion entre articulo y medida debe ser unicq. Si no recibe stock y espacio, el espacio quedaria null y el stock 0, el precio puede ser >=0. Si recibe espacio sin id, debera darlo de alta. Si no se puede dar de alta un articulo, medida o espacio no debe realizar el alta del inventario y realizar rollback de lo insertado. 

## CRUDs Proveedores

Descripcion:
- Requiere poder dar de alta/leer/actualizar y borrar de forma logica proveedores.
- Telefono funciona como identificador para saber si el proveedor ya existe.
- Nombre y Apellido funciona como identificador para saber si el proveedor ya existe.
- Se puede asociar al proveedor a 1 o mas categorias en proveedor_categoria

## CRUDs Lista Precios

- Requiere poder dar de alta/leer/actualizar y borrar de forma logica listas de precios. 
- Cuando se de alta una lista de precios. Los articulos pueden existir o no en la base de datos, por lo que debe chequear si se deben dar de alta nuevos o utilizas existentes (en este caso puede recibir id del articulo existente). Puede recibir un id de articulo propio del proveedor, por lo que almacenara en id_articulo_proveedor y no lo utilziara como id de articulo (este se autogenera si no existe).
- Cuando se actualize una lista de precios. Probablemente el proveedor ya tenga un asociados articulos en la tabla, solo se actualizara el precio de lista, el id del articulo propio del proveedor si esta cargado (id_articulo_proveedor) se puede usar como filtro validador de existencia.
- El alta se puede hacer recibiendo un json con uno o varios objetos (varios articulos) existentes o no con el precio de lista asociado (mayor>=0) y contendra el objeto de medida adentro del articulo, como header de este array estara el id del proveedor o el proveedor como objeto sin id (y se debe darlo de alta si no tiene id. En caso de no poder darlo de alta no generar guardado de nada).
- El alta se puede hacer recibiendo un excel con uno o varias lineas (varios articulos) existentes o no. Para comprender que columna corresponde a cada dato necesario para el alta (info de articulo, medida, precio de lista, etc) se recibira un json de mapeo formato array que reciba key como nombre de columna en la base de datos y value nombre de columna en el excel recibido. El metodo de alta leera el excel y prodra dar de alta los articulos, en caso de el valor del alguna linea no permita el insert de la informacion, no debe dar de alta nada de lo anterior (realizar rollback) y avisar que linea y columna dio conflictos. El id del proveedor o el proveedor como objeto sin id (se debe darlo de alta si no tiene id. En caso de no poder darlo de alta no generar guardado de nada) se recibira como header del json. En caso que el articulo ya exista se debe actualizar ese registro con la regla ya descripta.
- Para leer las listas de precios se debe poder filtrar por Categorias, por Articulos o por Proveedor y obtener un json de Lista de Precios con los filtrado. Si no se envia ningu filtro se debe recibir toda las Lista de precios existente. (Recomendable usar paginacion para no generar sobrecarga de transferencia de informacion).
- Para el borrado logico se hara por un registro en particular.

## CRUDs Presupuestos

- Requiere poder dar de alta/leer/actualizar y borrar de forma logica listas de precios. 
- Cuando se da de alta un nuevo presupuesto se da de alta un presupuesto_cabecera y uno o muchos presupuesto_detalle.
- en presupuesto_cabecera numero es autoincremental iniciando en 1
- Al leer se debe obtener todos los registros de detalle en array y presupuesto_cabecera
- Para dar de alta presupuestos se recibira un array de id de inventarios, se debe complentar la informacion de presupuesto_detalle replicando la informacion del inventario
- en presupuesto_detalle de debe calcular sub_total multiplcando cantida por precio_venta obtenido de inventario 
- en presupuesto_cabecera se debe calcular cantidad con la suma de cantidad de detalle y total con la suma de sub_total de detalle
- Generar un metodo que reciba un numero o id presupuesto y devuelva el PDF del mismo.


## CRUDs metodos de pago

Descripcion:
- Requiere poder dar de alta/leer/actualizar y borrar de forma logica nuevos metodos de pago.

## CRUDs venta

Descripcion:
- Requiere poder dar de alta/leer/actualizar y borrar de forma logica nuevas ventas.
- Cuando se da de alta una nueva venta se da de alta un venta_cabecera y uno o muchos venta_detalle.
- Para dar de alta venta se recibira un id de inventarios, se debe completar la informacion de la venta replicando la informacion del inventario y descontar el stock del inventario segun cantidad vendida
- Por defecto las ventas se crean en aprobado=false al menos que se especifica aprobado: true.

