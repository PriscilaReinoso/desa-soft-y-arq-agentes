## Purpose

Proporciona la infraestructura containerizada local en Docker Compose con base de datos PostgreSQL 16 e inicialización automática de esquema y datos de muestra para el inventario de ferretería.

## ADDED Requirements

### Requirement: Despliegue de PostgreSQL con Docker Compose
El sistema DEBE incluir la definición de servicios en `docker-compose.yml` para ejecutar PostgreSQL 16 Alpine expuesto en el puerto 5432 con credenciales de desarrollo.

#### Scenario: Inicio del contenedor de base de datos
- **WHEN** se ejecuta el comando `docker compose up -d`
- **THEN** el contenedor `ferreteria-db` se inicia exitosamente escuchando conexiones en `localhost:5432` a la base de datos `ferreteria_db`.

### Requirement: Carga automática de datos de prueba
El sistema DEBE incluir un script `docker/init.sql` que se monte en `/docker-entrypoint-initdb.d/` para crear la estructura de tablas e insertar datos iniciales de ferretería en el primer arranque.

#### Scenario: Creación de tablas e inserción de seed data
- **WHEN** el contenedor de PostgreSQL se inicializa por primera vez
- **THEN** se crean las tablas `categories`, `suppliers`, `products` y `stock_movements`, e insertan productos y movimientos de prueba representativos de una ferretería.
