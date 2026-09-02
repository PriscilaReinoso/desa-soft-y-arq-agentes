## 1. Repositorio de medidas

- [x] 1.1 Agregar en `MedidaRepository` el método `unidades()` que devuelve las `unidad_medida` distintas y activas (sin `deleted_at`), excluyendo valores vacíos

## 2. Servicio de listas de precios

- [x] 2.1 Agregar el helper de módulo `_mapa_unidades(unidades_db)` que fusiona las unidades de la DB (prevalece, keys en minúscula) con `UNIDADES_CONOCIDAS` como respaldo vía `setdefault`
- [x] 2.2 Modificar `_parsear_articulo_medida` para recibir el mapa de unidades por parámetro y usarlo en lugar de `UNIDADES_CONOCIDAS`
- [x] 2.3 En `alta_excel`, construir el mapa una vez por petición con `self.medida_repository.unidades()` y pasarlo a cada llamada de `_item_desde_fila`
- [x] 2.4 Propagar `unidades` desde `_item_desde_fila` a la llamada de `_parsear_articulo_medida`

## 3. Tests

- [x] 3.1 Test: una unidad existente en la tabla `medida` que no está en el respaldo (p. ej. "caja") se reconoce en el texto combinado ("Tornillo 5caja" -> articulo "Tornillo", unidad "caja", cantidad "5"), reutilizando la medida existente si coincide la cantidad
- [x] 3.2 Test: la unidad de la DB se crea si la combinación unidad+cantidad no existe aún (look-or-create desde columna combinada)
- [x] 3.3 Test: la unidad de la base de datos prevalece sobre el respaldo en caso de colisión
- [x] 3.4 Verificar que los tests existentes de columna combinada y "no corresponde" siguen pasando (DB vacía al parsear -> actúa el respaldo)

## 4. Validación

- [x] 4.1 Ejecutar la suite de tests de `test_lista_precios.py` y confirmar que pasan
- [x] 4.2 Ejecutar la suite completa de pytest y confirmar que no hay regresiones

## 5. Medida por defecto "1 unidad"

- [x] 5.1 Reemplazar `MEDIDA_NO_CORRESPONDE` ("no corresponde") por la medida por defecto `("unidad", "1")` en `_parsear_articulo_medida`
- [x] 5.2 Actualizar los tests existentes que esperaban "no corresponde" a esperar la medida "1 unidad" y su reutilización entre filas