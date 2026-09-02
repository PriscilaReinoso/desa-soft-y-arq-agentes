## 1. Categorías y medios de pago

- [x] 1.1 Agregar en `init.sql` la carga idempotente de las 7 categorías con su `nombre` y `descripcion` (usando `ON CONFLICT (nombre) DO NOTHING`).
- [x] 1.2 Agregar en `init.sql` la carga idempotente de los 3 métodos de pago (Tarjeta, Transferencia, Efectivo) con `ON CONFLICT (nombre) DO NOTHING`.

## 2. Medidas

- [x] 2.1 Agregar en `init.sql` el `INSERT ... SELECT` que cruza las unidades (unidad, kg, g, ml, lts, mt, mm, cm, pulgadas, cc) con los valores (1, 1/2, 1/4, 1/8, 1/3, 3/4) para poblar el set completo de medidas, idempotente (sin duplicar combinaciones existentes).

## 3. Artículos con descripción y categoría

- [x] 3.1 Agregar en `init.sql` la carga de los artículos del issue (thiner, aguarrás, ácido muriático, quitasarro, removedor en gel, codos espiga, hormiguicida, alargues richi, buscapolo, caja de herramientas y cepillo de acero) con su `nombre` SIN la medida (p. ej. "THINER", "CODO ESPIGA"), `descripcion` y `categoria_id` resuelto por nombre, usando `ON CONFLICT (nombre) DO NOTHING`. Como `articulo.nombre` es UNIQUE, cuando un producto tiene varias presentaciones se carga una sola (la primera).

## 4. Inventario inicial

- [x] 4.1 Definir para cada artículo su medida (unidad_medida, medida) según su presentación y documentar ese mapeo con comentarios en `init.sql`.
- [x] 4.2 Agregar en `init.sql` la creación idempotente de una fila en `inventario` por artículo, con `medida_id` resuelto por nombre, `stock` y `precio_venta` aleatorios no negativos y `minimo_stock`, asegurando al menos un caso de stock bajo (stock < minimo_stock), con `ON CONFLICT (articulo_id, medida_id) DO NOTHING`.

## 5. Depósito y espacios

- [x] 5.1 Agregar en `init.sql` la carga idempotente del depósito "Local principal" (con `descripcion`, `direccion` y `cantidad_espacios` = 2), usando `WHERE NOT EXISTS` para no duplicarlo.
- [x] 5.2 Agregar en `init.sql` la carga idempotente de dos espacios de tipo "Estantería" en el depósito (uno de pinturas y químicos y otro de herramientas y eléctricos), con su `descripcion`, `max_fila` y `max_columna`.
- [x] 5.3 Actualizar la creación de `inventario` en `init.sql` para que cada artículo se ubique en uno de esos espacios (`espacio_id`, `fila`, `columna` dentro de los límites), manteniendo `ON CONFLICT (articulo_id, medida_id) DO NOTHING`.

## 6. Validación

- [x] 6.1 Levantar el stack (docker compose) y verificar que `migrate` ejecuta `init.sql` sin errores tras `alembic upgrade head`.
- [x] 6.2 Verificar contra PostgreSQL que las tablas `categoria`, `metodo_pago`, `medida`, `articulo`, `inventario`, `deposito` y `espacio` quedaron pobladas según lo esperado.
- [x] 6.3 Re-ejecutar `init.sql` y comprobar que no produce errores ni duplica registros (idempotencia).
