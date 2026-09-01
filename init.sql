-- init.sql
-- Inicialización / datos por defecto de la base de datos compartida (ferretería).
--
-- El esquema (CREATE TABLE) lo gestiona exclusivamente alembic, por lo que
-- este archivo SOLO contiene carga de datos idempotente. Se ejecuta desde el
-- servicio `migrate` del docker-compose DESPUÉS de `alembic upgrade head`,
-- cuando las tablas ya existen.
--
-- Usa ON CONFLICT DO NOTHING para ser idempotente: no quedan asociados a una
-- revisión de alembic y pueden re-ejecutarse sin romper nada.

-- Datos de inicio: roles del sistema
INSERT INTO rol (id, nombre, descripcion, created_at, updated_at) VALUES
    (gen_random_uuid(), 'ADMIN', 'Administrador del sistema', now(), now()),
    (gen_random_uuid(), 'CONSULTOR', 'Consulta de inventario', now(), now())
ON CONFLICT (nombre) DO NOTHING;

-- Usuario inicial: admin / admin123
INSERT INTO usuario (id, nombre, apellido, username, email, password_hash, role_id, activo, created_at, updated_at)
SELECT
    gen_random_uuid(), 'Priscila', 'Reinoso', 'admin', 'pri@gmail.com',
    '52cacec3a320fdd37223652e1dcd3162$ef765ccdc257c41e25fac52cc56a2ad1c1eb15fa49673eaafeaf35a5d6978dd8',
    id, true, now(), now()
FROM rol
WHERE nombre = 'ADMIN'
ON CONFLICT (username) DO NOTHING;

-- Infraestructura de búsqueda semántica del MCP Server (change mcp-busquedas-semanticas):
--   * activa la extensión pgvector
--   * crea la tabla articulo_embedding para almacenar los vectores de cada artículo
-- Corre tras `alembic upgrade head`, cuando `articulo` ya existe. Idempotente.
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS articulo_embedding (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    articulo_id UUID NOT NULL REFERENCES articulo(id),
    texto_enriquecido TEXT NOT NULL,
    embedding vector(384) NOT NULL,
    created_at TIMESTAMP DEFAULT now(),
    UNIQUE (articulo_id)
);

CREATE INDEX IF NOT EXISTS ix_articulo_embedding_hnsw
    ON articulo_embedding USING hnsw (embedding vector_cosine_ops);

-- ============================================================
-- Datos base de catálogo (change IF-35 / init-base)
--   * categorías, medios de pago, medidas, artículos e inventario inicial.
-- Idempotente (ON CONFLICT DO NOTHING). Corre tras `alembic upgrade head`.
-- ============================================================

-- Categorías
INSERT INTO categoria (id, nombre, descripcion, created_at, updated_at) VALUES
    (gen_random_uuid(), 'Herramientas Manuales', 'Instrumentos que funcionan únicamente con la fuerza humana.', now(), now()),
    (gen_random_uuid(), 'Herramientas Eléctricas y a Batería', 'Equipos motorizados para optimizar tiempo y esfuerzo en tareas pesadas o de precisión.', now(), now()),
    (gen_random_uuid(), 'Tornillería, Fijaciones y Anclajes', 'Elementos esenciales para ensamblar, asegurar y unir estructuras o superficies.', now(), now()),
    (gen_random_uuid(), 'Fontanería y Plomería', 'Materiales destinados a la instalación, reparación y conducción de agua o gas.', now(), now()),
    (gen_random_uuid(), 'Electricidad e Iluminación', 'Insumos para instalaciones eléctricas residenciales e industriales.', now(), now()),
    (gen_random_uuid(), 'Pinturas y Complementos', 'Productos para revestimiento, decoración y protección de superficies.', now(), now()),
    (gen_random_uuid(), 'Adhesivos, Siliconas y Químicos', 'Sustancias de alta adherencia y sellado para múltiples materiales.', now(), now())
ON CONFLICT (nombre) DO NOTHING;

-- Medios de pago
INSERT INTO metodo_pago (id, nombre, descripcion, created_at, updated_at) VALUES
    (gen_random_uuid(), 'Tarjeta (Débito/Crédito)', 'Pago con tarjeta de débito o crédito.', now(), now()),
    (gen_random_uuid(), 'Transferencia', 'Pago mediante transferencia bancaria.', now(), now()),
    (gen_random_uuid(), 'Efectivo', 'Pago en efectivo.', now(), now())
ON CONFLICT (nombre) DO NOTHING;

-- Medidas: set completo de combinaciones (unidad_medida x medida)
INSERT INTO medida (id, unidad_medida, medida, created_at, updated_at)
SELECT gen_random_uuid(), u.unidad, v.valor, now(), now()
FROM (VALUES ('unidad'),('kg'),('g'),('ml'),('lts'),('mt'),('mm'),('cm'),('p'),('pulgadas'),('cc')) AS u(unidad),
     (VALUES ('1'),('1/2'),('1/4'),('1/8'),('1/3'),('3/4')) AS v(valor)
ON CONFLICT (unidad_medida, medida) DO NOTHING;

-- Medidas específicas de artículos fuera del set básico (presentaciones puntuales)
INSERT INTO medida (id, unidad_medida, medida, created_at, updated_at) VALUES
    (gen_random_uuid(), 'lts', '5',  now(), now()),
    (gen_random_uuid(), 'cc',  '60', now(), now()),
    (gen_random_uuid(), 'cc',  '100', now(), now()),
    (gen_random_uuid(), 'cc',  '250', now(), now()),
    (gen_random_uuid(), 'mt',  '10', now(), now()),
    (gen_random_uuid(), 'p',   '13', now(), now())
ON CONFLICT (unidad_medida, medida) DO NOTHING;

-- Artículos (categoria_id resuelto por nombre).
-- El nombre NO incluye la medida/presentación (se asocia vía tabla medida en inventario).
-- Por la restricción UNIQUE de `articulo.nombre`, cuando un producto tiene varias presentaciones
-- (ej. ácido muriático 1/5 lts, removedor 1/2 y 1 lts, codo espiga 1/2/3/4/1", hormiguicida 60/100/250cc)
-- se carga UNA sola presentación (la primera) por producto.
INSERT INTO articulo (id, nombre, descripcion, categoria_id, created_at, updated_at) VALUES
    -- Pinturas y Complementos
    (gen_random_uuid(), 'THINER', 'Disolvente para adelgazar pinturas, limpiar herramientas y superficies.', (SELECT id FROM categoria WHERE nombre = 'Pinturas y Complementos'), now(), now()),
    (gen_random_uuid(), 'AGUARRAS', 'Disolvente mineral para limpieza de pinceles y dilución de esmaltes.', (SELECT id FROM categoria WHERE nombre = 'Pinturas y Complementos'), now(), now()),
    (gen_random_uuid(), 'ACIDO MURIATICO', 'Acido clorhídrico diluido para limpieza pesada de superficies.', (SELECT id FROM categoria WHERE nombre = 'Pinturas y Complementos'), now(), now()),
    (gen_random_uuid(), 'QUITASARRO', 'Producto para eliminar sarro y manchas de agua en sanitarios y superficies.', (SELECT id FROM categoria WHERE nombre = 'Pinturas y Complementos'), now(), now()),
    (gen_random_uuid(), 'REMOVEDOR EN GEL', 'Removedor de pintura en gel para superficies.', (SELECT id FROM categoria WHERE nombre = 'Pinturas y Complementos'), now(), now()),
    -- Fontanería y Plomería
    (gen_random_uuid(), 'CODO ESPIGA', 'Codo de espiga para conexiones de agua.', (SELECT id FROM categoria WHERE nombre = 'Fontanería y Plomería'), now(), now()),
    -- Adhesivos, Siliconas y Químicos
    (gen_random_uuid(), 'HORMIGUICIDA LIQUIDO HOR MIX', 'Líquido hormiguicida de acción rápida.', (SELECT id FROM categoria WHERE nombre = 'Adhesivos, Siliconas y Químicos'), now(), now()),
    -- Electricidad e Iluminación
    (gen_random_uuid(), 'ALARGUES REFORZADOS RICHI', 'Alargue eléctrico reforzado para uso exigente.', (SELECT id FROM categoria WHERE nombre = 'Electricidad e Iluminación'), now(), now()),
    (gen_random_uuid(), 'BUSCAPOLO NACIONAL', 'Buscapolo eléctrico para detectar fase y tensión en instalaciones.', (SELECT id FROM categoria WHERE nombre = 'Electricidad e Iluminación'), now(), now()),
    -- Herramientas
    (gen_random_uuid(), 'CAJA DE HERRAMIENTA C/BANDEJA TAPA ALTA', 'Caja de herramientas con bandeja y tapa alta.', (SELECT id FROM categoria WHERE nombre = 'Herramientas Manuales'), now(), now()),
    (gen_random_uuid(), 'CEPILLO DE ACERO BRONCEADO', 'Cepillo de acero bronceado con mango de madera.', (SELECT id FROM categoria WHERE nombre = 'Herramientas Manuales'), now(), now())
ON CONFLICT (nombre) DO NOTHING;

-- Depósito principal (IF-35). `deposito.nombre` no es UNIQUE, por lo que se
-- inserta solo si aún no existe uno con ese nombre.
INSERT INTO deposito (id, nombre, descripcion, direccion, cantidad_espacios, created_at, updated_at)
SELECT
    gen_random_uuid(),
    'Local principal',
    'Depósito principal de la ferretería para almacenar la mercadería.',
    'Av. San Martín 1234, Ciudad, Provincia',
    2,
    now(),
    now()
WHERE NOT EXISTS (SELECT 1 FROM deposito WHERE nombre = 'Local principal');

-- Dos espacios tipo estantería en el depósito principal (IF-35), con sus
-- dimensiones (max_fila x max_columna). Idempotente: se insertan solo si el
-- depósito aún no tiene espacios.
INSERT INTO espacio (id, tipo, descripcion, deposito_id, max_fila, max_columna, created_at, updated_at)
SELECT
    gen_random_uuid(),
    'Estantería',
    s.descripcion,
    d.id,
    s.max_fila,
    s.max_columna,
    now(),
    now()
FROM deposito d
CROSS JOIN (VALUES
    ('Estantería A - zona de pinturas y químicos', 4, 5),
    ('Estantería B - zona de herramientas y eléctricos', 4, 5)
) AS s(descripcion, max_fila, max_columna)
WHERE d.nombre = 'Local principal'
  AND NOT EXISTS (SELECT 1 FROM espacio e WHERE e.deposito_id = d.id)
ON CONFLICT DO NOTHING;

-- Inventario inicial por artículo.
-- Mapeo artículo -> medida (unidad_medida, medida); la medida SE ASOCIA aquí y NO va en el nombre:
--   THINER / AGUARRAS / ACIDO MURIATICO / QUITASARRO  -> lts/1
--   REMOVEDOR EN GEL                                  -> lts/1/2
--   CODO ESPIGA                                       -> p/1/2
--   HORMIGUICIDA LIQUIDO HOR MIX                      -> cc/60
--   ALARGUES REFORZADOS RICHI                         -> mt/10
--   BUSCAPOLO NACIONAL                                -> unidad/1
--   CAJA DE HERRAMIENTA C/BANDEJA TAPA ALTA           -> p/13
--   CEPILLO DE ACERO BRONCEADO                        -> unidad/1
-- stock aleatorio no negativo con algunos casos de stock bajo (stock < minimo_stock).
-- Cada artículo se ubica en una de las dos estanterías del depósito (espacio_id,
-- fila, columna).
INSERT INTO inventario (id, articulo_id, medida_id, espacio_id, fila, columna, stock, minimo_stock, precio_venta, created_at, updated_at)
SELECT
    gen_random_uuid(),
    a.id,
    m.id,
    esp.id,
    d.fila,
    d.columna,
    d.stock,
    d.minimo_stock,
    d.precio,
    now(),
    now()
FROM (VALUES
    -- Estantería A (pinturas y químicos)
    ('THINER',                              'lts',    '1',   'Estantería A - zona de pinturas y químicos', 1, 1, (random()*20)::int, 5, round((5 + random()*200)::numeric, 2)),
    ('AGUARRAS',                            'lts',    '1',   'Estantería A - zona de pinturas y químicos', 1, 2, (random()*20)::int, 5, round((5 + random()*200)::numeric, 2)),
    ('ACIDO MURIATICO',                     'lts',    '1',   'Estantería A - zona de pinturas y químicos', 1, 3, 2,                   8, round((5 + random()*200)::numeric, 2)),
    ('QUITASARRO',                          'lts',    '1',   'Estantería A - zona de pinturas y químicos', 2, 1, (random()*20)::int, 5, round((5 + random()*200)::numeric, 2)),
    ('REMOVEDOR EN GEL',                    'lts',    '1/2', 'Estantería A - zona de pinturas y químicos', 2, 2, (random()*20)::int, 5, round((5 + random()*200)::numeric, 2)),
    ('HORMIGUICIDA LIQUIDO HOR MIX',        'cc',     '60',  'Estantería A - zona de pinturas y químicos', 2, 3, (random()*15)::int, 5, round((3 + random()*80)::numeric, 2)),
    -- Estantería B (herramientas y eléctricos)
    ('CODO ESPIGA',                         'p',      '1/2', 'Estantería B - zona de herramientas y eléctricos', 1, 1, 0,               10, round((5 + random()*100)::numeric, 2)),
    ('ALARGUES REFORZADOS RICHI',           'mt',     '10',  'Estantería B - zona de herramientas y eléctricos', 1, 2, (random()*10)::int, 3, round((20 + random()*800)::numeric, 2)),
    ('BUSCAPOLO NACIONAL',                  'unidad', '1',   'Estantería B - zona de herramientas y eléctricos', 2, 1, (random()*25)::int, 8, round((5 + random()*150)::numeric, 2)),
    ('CAJA DE HERRAMIENTA C/BANDEJA TAPA ALTA', 'p',  '13',  'Estantería B - zona de herramientas y eléctricos', 2, 2, 1,               4, round((50 + random()*2000)::numeric, 2)),
    ('CEPILLO DE ACERO BRONCEADO',          'unidad', '1',   'Estantería B - zona de herramientas y eléctricos', 2, 3, (random()*20)::int, 6, round((5 + random()*200)::numeric, 2))
) AS d(nombre, unidad, medida, espacio, fila, columna, stock, minimo_stock, precio)
JOIN articulo a  ON a.nombre = d.nombre
JOIN medida   m  ON m.unidad_medida = d.unidad AND m.medida = d.medida
JOIN espacio esp ON esp.descripcion = d.espacio
ON CONFLICT (articulo_id, medida_id) DO NOTHING;
