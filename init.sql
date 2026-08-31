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
