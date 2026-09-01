SELECT a.nombre, u.unidad_medida, u.medida
FROM medida u
JOIN inventario i ON i.medida_id = u.id
JOIN articulo a ON a.id = i.articulo_id
WHERE u.unidad_medida IN ('Unidad','Pulgadas')
   OR u.medida LIKE '%"%' OR u.medida LIKE '%''%'
   OR u.medida IN ('16 oz','500W')
ORDER BY a.nombre;
