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