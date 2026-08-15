-- Initial SQL Script for Hardware Store Inventory (Ferretería)

-- Categorías de Productos
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);

-- Proveedores
CREATE TABLE IF NOT EXISTS suppliers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    contact_name VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(50)
);

-- Productos del Inventario
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    sku VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category_id INT REFERENCES categories(id) ON DELETE SET NULL,
    supplier_id INT REFERENCES suppliers(id) ON DELETE SET NULL,
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
    cost_price NUMERIC(10, 2) NOT NULL CHECK (cost_price >= 0),
    stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    min_stock_level INT NOT NULL DEFAULT 5 CHECK (min_stock_level >= 0),
    location_rack VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Historial de Movimientos de Stock
CREATE TABLE IF NOT EXISTS stock_movements (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    movement_type VARCHAR(20) NOT NULL CHECK (movement_type IN ('ENTRY', 'EXIT', 'ADJUSTMENT')),
    quantity INT NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Inserción de Categorías
INSERT INTO categories (name, description) VALUES
('Herramientas Manuales', 'Martillos, destornilladores, pinzas, llaves y herramientas de mano'),
('Herramientas Eléctricas', 'Taladros, amoladoras, sierras circulares y rotomartillos'),
('Bulonería y Fijaciones', 'Tornillos autoperforantes, tarugos, bulones, tuercas y arandelas'),
('Pinturas y Adhesivos', 'Pinturas látex, esmaltes sintéticos, pinceles, selladores y siliconas'),
('Plomería y Grifería', 'Caños PVC y termofusión, llaves de paso, flexibles y repuestos');

-- Inserción de Proveedores
INSERT INTO suppliers (name, contact_name, email, phone) VALUES
('Distribuidora Ferretera Central', 'Juan Pérez', 'contacto@ferreteracentral.com', '+54 11 4444-5555'),
('Bosch Herramientas Argentina', 'María López', 'ventas@bosch-tools.com.ar', '+54 11 8888-9999'),
('Sinteplast Argentina', 'Carlos Gómez', 'pedidos@sinteplast.com', '+54 11 3333-2222'),
('Bulonera Industrial SRL', 'Ana Martínez', 'ventas@buloneraindustrial.com', '+54 11 7777-1111');

-- Inserción de Productos Ficticios de Prueba
INSERT INTO products (sku, name, description, category_id, supplier_id, unit_price, cost_price, stock_quantity, min_stock_level, location_rack) VALUES
('HM-MAR-001', 'Martillo Galponero 16oz Stanley', 'Martillo galponero con mango de fibra de vidrio y empuñadura antideslizante', 1, 1, 15500.00, 10000.00, 15, 5, 'Pasillo 1 - Estante A'),
('HM-DES-002', 'Juego de Destornilladores 6 Pcs Stanley', 'Set de 3 destornilladores planos y 3 phillips con puntas imantadas', 1, 1, 12800.00, 8000.00, 3, 10, 'Pasillo 1 - Estante B'),
('HM-PIN-003', 'Pinza Universal 8 pulgadas Iso-Pro', 'Pinza de fuerza universal de acero cromo vanadio', 1, 1, 9500.00, 6000.00, 22, 6, 'Pasillo 1 - Estante C'),
('HE-TAL-101', 'Taladro Percutor Bosch GSB 550W', 'Taladro percutor mandril 13mm velocidad variable e inversor de giro', 2, 2, 85000.00, 60000.00, 8, 4, 'Pasillo 2 - Estante A'),
('HE-AMO-102', 'Amoladora Angular Bosch GWS 700W 4.5"', 'Amoladora compacta para discos de 115mm', 2, 2, 78000.00, 52000.00, 4, 5, 'Pasillo 2 - Estante B'),
('BUL-TOR-501', 'Tornillos Autoperforantes 1 1/2 (Caja 100u)', 'Tornillos para madera y durlock de acero zincado', 3, 4, 4500.00, 2500.00, 45, 15, 'Pasillo 3 - Estante C'),
('BUL-TAR-502', 'Tarugos Fischer 8mm con Tope (Bolsa 50u)', 'Tarugos de nylon de alta expansión', 3, 4, 2800.00, 1500.00, 80, 20, 'Pasillo 3 - Estante D'),
('PIN-LAT-201', 'Pintura Látex Interior Blanco 20L Sinteplast', 'Pintura lavable de alto rendimiento para interiores mate', 4, 3, 42000.00, 28000.00, 2, 5, 'Pasillo 4 - Depósito 1'),
('PIN-PIN-202', 'Pincel Nro 20 Cerda China Pura', 'Pincel profesional para todo tipo de pinturas', 4, 3, 2300.00, 1200.00, 35, 10, 'Pasillo 4 - Estante A'),
('PLO-CAN-301', 'Caño Termofusión Agua 25mm 4m', 'Caño PPR para agua fría y caliente de alta presión', 5, 1, 6200.00, 3800.00, 25, 8, 'Pasillo 5 - Estantería Tubos');

-- Movimientos Iniciales de Ejemplo
INSERT INTO stock_movements (product_id, movement_type, quantity, reason) VALUES
(1, 'ENTRY', 15, 'Carga inicial de inventario'),
(2, 'ENTRY', 10, 'Carga inicial de inventario'),
(2, 'EXIT', 7, 'Venta en mostrador comprobante #1042'),
(4, 'ENTRY', 8, 'Recepcion de pedido orden de compra #8812'),
(8, 'ENTRY', 2, 'Stock inicial recibido');
