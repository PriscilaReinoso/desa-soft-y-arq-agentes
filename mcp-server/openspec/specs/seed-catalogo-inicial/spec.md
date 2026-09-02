# seed-catalogo-inicial Specification

## Purpose

Precarga de datos base del catálogo de la ferretería (categorías, medios de pago, medidas, artículos y su inventario inicial) de forma idempotente desde `init.sql`, para que el sistema disponga de datos reales de catálogo con los que trabajar y probar desde el primer arranque del stack.

## Requirements

### Requirement: Precarga de categorías
El sistema SHALL cargar, de forma idempotente, las 7 categorías definidas en IF-35, cada una con su `nombre` y `descripcion`.

#### Scenario: Carga idempotente de categorías
- **WHEN** `init.sql` se ejecuta contra una base con el esquema ya creado por alembic
- **THEN** existan las categorías "Herramientas Manuales", "Herramientas Eléctricas y a Batería", "Tornillería, Fijaciones y Anclajes", "Fontanería y Plomería", "Electricidad e Iluminación", "Pinturas y Complementos" y "Adhesivos, Siliconas y Químicos", cada una con su descripción
- **AND** re-ejecutar `init.sql` no duplique ni modifique esas categorías

### Requirement: Precarga de medios de pago
El sistema SHALL cargar, de forma idempotente, los 3 métodos de pago base: "Tarjeta (Débito/Crédito)", "Transferencia" y "Efectivo".

#### Scenario: Carga de métodos de pago
- **WHEN** `init.sql` se ejecuta
- **THEN** existan los métodos de pago "Tarjeta (Débito/Crédito)", "Transferencia" y "Efectivo"
- **AND** re-ejecutar `init.sql` no duplique esos métodos de pago

### Requirement: Precarga del set completo de medidas
El sistema SHALL cargar, de forma idempotente, todas las combinaciones posibles de `unidad_medida` × `medida`: unidades {unidad, kg, g, ml, lts, mt, mm, cm, pulgadas, cc} por valores {1, 1/2, 1/4, 1/8, 1/3, 3/4}, incluyendo la combinación base "unidad/1".

#### Scenario: Carga de combinaciones de medida
- **WHEN** `init.sql` se ejecuta
- **THEN** la tabla `medida` contenga la combinación base ("unidad", "1") más todas las combinaciones de cada unidad por cada valor
- **AND** re-ejecutar `init.sql` no cree medidas duplicadas

### Requirement: Precarga de artículos con descripción y categoría
El sistema SHALL cargar, de forma idempotente, los artículos listados en IF-35, cada uno con su `nombre` (sin la medida/presentación en el texto), una `descripcion` y su categoría asociada (resuelta por nombre). Dado que `articulo.nombre` es único, cuando un producto tiene varias presentaciones en el issue (p. ej. ácido muriático 1/5 lts, removedor 1/2 y 1 lts, codo espiga 1/2/3/4/1", hormiguicida 60/100/250cc) el sistema carga una sola presentación por producto.

#### Scenario: Carga de artículos asociados a su categoría
- **WHEN** `init.sql` se ejecuta
- **THEN** existan todos los artículos listados en el issue (thiner, aguarrás, ácido muriático, quitasarro, removedor, codos espiga, hormiguicida, alargues, buscapolo, caja de herramientas y cepillo de acero, entre otros)
- **AND** el `nombre` de cada artículo no contenga la medida/presentación (p. ej. "THINER", "CODO ESPIGA", "ACIDO MURIATICO")
- **AND** cada artículo tenga una `descripcion` no vacía
- **AND** el `categoria_id` de cada artículo corresponda a la categoría indicada en el issue (Pinturas, Fontanería, Químicos, Electricidad, Herramientas)
- **AND** re-ejecutar `init.sql` no duplique artículos

### Requirement: Inventario inicial vinculado a la medida y con valores aleatorios
El sistema SHALL crear, de forma idempotente, una fila en `inventario` por cada artículo precargado, vinculada a la `medida` definida para ese artículo, con `stock` y `precio_venta` de valores aleatorios no negativos e incluyendo algunos casos de stock bajo por debajo del `minimo_stock`.

#### Scenario: Creación de inventario por artículo
- **WHEN** `init.sql` se ejecuta
- **THEN** exista una fila en `inventario` por cada artículo precargado
- **AND** cada fila tenga su `medida_id` apuntando a la medida correspondiente al artículo (según su presentación, p. ej. "lts/1", "lts/1/2", "p/1/2", "cc/60", "mt/10", "p/13", "unidad/1")
- **AND** `stock` y `precio_venta` sean no negativos
- **AND** al menos un artículo tenga `stock` menor que su `minimo_stock` (stock bajo)
- **AND** re-ejecutar `init.sql` no cree filas de inventario duplicadas para el mismo par (artículo, medida)

### Requirement: Precarga de depósito
El sistema SHALL cargar, de forma idempotente, un depósito "Local principal" con información de ejemplo (descripción, dirección y `cantidad_espacios`).

#### Scenario: Carga idempotente del depósito
- **WHEN** `init.sql` se ejecuta
- **THEN** exista un depósito con `nombre` = "Local principal"
- **AND** tenga `descripcion` y `direccion` no vacías
- **AND** su `cantidad_espacios` sea 2
- **AND** re-ejecutar `init.sql` no genere un segundo depósito con ese nombre

### Requirement: Precarga de espacios tipo estantería
El sistema SHALL cargar, de forma idempotente, dos espacios de tipo "Estantería" asociados al depósito "Local principal", cada uno con su `descripcion`, `max_fila` y `max_columna`, para ubicar los artículos.

#### Scenario: Carga idempotente de las estanterías
- **WHEN** `init.sql` se ejecuta
- **THEN** existan dos espacios de tipo "Estantería" en el depósito "Local principal" (por ejemplo, una zona de pinturas y químicos y una de herramientas y eléctricos)
- **AND** cada uno tenga `max_fila` y `max_columna` positivos
- **AND** re-ejecutar `init.sql` no cree espacios duplicados para el depósito

### Requirement: Inventario ubicado en un espacio del depósito
El sistema SHALL vincular cada fila de `inventario` de los artículos precargados a uno de los espacios (estanterías) del depósito, indicando su `fila` y `columna` dentro de los límites de ese espacio.

#### Scenario: Inventario asignado a una estantería
- **WHEN** `init.sql` se ejecuta
- **THEN** cada fila de `inventario` de los artículos del catálogo tenga un `espacio_id` no nulo apuntando a una de las estanterías del depósito
- **AND** se conozca la `fila` y `columna` dentro de los límites (`max_fila` x `max_columna`) del espacio
- **AND** re-ejecutar `init.sql` no duplique filas de inventario para el mismo par (artículo, medida)

### Requirement: Carga idempotente global
Todos los `INSERT` del archivo `init.sql` SHALL usar `ON CONFLICT DO NOTHING` y resolver sus claves foráneas por nombre (subconsultas `SELECT` sobre la clave natural), de modo que el archivo pueda re-ejecutarse sin errores ni datos duplicados.

#### Scenario: Re-ejecución de init.sql
- **WHEN** `init.sql` se ejecuta una segunda vez sobre la misma base
- **THEN** no se produzca ningún error
- **AND** los totales de filas en `categoria`, `metodo_pago`, `medida`, `articulo` e `inventario` se mantengan sin duplicados