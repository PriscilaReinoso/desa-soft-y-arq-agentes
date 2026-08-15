
# Esquema de Base de Datos

## Información General

- Proyecto: Sistema de Gestión de Inventario para Ferretería
- Base de datos: PostgreSQL
- ORM: SQLAlchemy 2.0
- Migraciones: Alembic

## Convenciones

- PK UUID en todas las tablas (`id`), salvo tablas puente si se decide PK compuesta.
- Todas las tablas incluyen: `created_at`, `updated_at`, `deleted_at`.
- Fechas en UTC-3.
- snake_case para tablas y columnas.
- FK terminan en `_id`.

---

# Entidades

## rol

Campos:
- id UUID PK
- nombre VARCHAR(50) UNIQUE NOT NULL
- descripcion TEXT

Índices:
- INDEX(nombre)

Relaciones:
- 1:N con usuario

---

## usuario

Campos:
- id UUID PK
- nombre VARCHAR(100) NOT NULL
- apellido VARCHAR(100) NOT NULL
- username VARCHAR(50) UNIQUE NOT NULL
- email VARCHAR(255) UNIQUE NOT NULL
- password_hash TEXT NOT NULL
- role_id UUID FK -> role.id
- activo BOOLEAN DEFAULT TRUE

Índices:
- INDEX(username)
- INDEX(email)
- INDEX(apellido)

Restricciones:
- UNIQUE(username)
- UNIQUE(email)

Relaciones:
- N:1 role

---

## categoria

Campos:
- id UUID PK
- nombre VARCHAR(50) UNIQUE NOT NULL
- descripcion TEXT

Relaciones:
- 1:N articulo

---

## articulo

Campos:
- id UUID PK
- nombre VARCHAR(100) NOT NULL
- descripcion TEXT
- categoria_id UUID FK -> categoria.id

Restricciones:
- UNIQUE(nombre)

Índices:
- INDEX(nombre)
- INDEX(categoria_id)

Relaciones:
- N:1 categoria
- 1:N inventario
- 1:N lista_precios

---

## medida

Campos:
- id UUID PK
- unidad_medida VARCHAR(30) NOT NULL
- medida VARCHAR(30) NOT NULL

Restricciones:
- UNIQUE(unidad_medida, medida)

Relaciones:
- 1:N inventario
- 1:N lista_precios

---

## deposito

Campos:
- id UUID PK
- nombre VARCHAR(100) NOT NULL
- descripcion TEXT
- direccion VARCHAR(255)
- cantidad_espacios INTEGER DEFAULT 0

Relaciones:
- 1:N espacio

---

## espacio

Campos:
- id UUID PK
- tipo VARCHAR(50)
- descripcion TEXT
- deposito_id UUID FK -> deposito.id
- max_fila INTEGER
- max_columna INTEGER

Índices:
- INDEX(deposito_id)

Relaciones:
- N:1 deposito
- 1:N inventario

---

## inventario

Descripción:
Representa una variante de un artículo según su medida y ubicación.

Campos:
- id UUID PK
- articulo_id UUID FK -> articulo.id
- medida_id UUID FK -> medida.id
- espacio_id UUID FK -> espacio.id
- fila INTEGER
- columna INTEGER
- stock INTEGER DEFAULT 0
- minimo_stock INTEGER DEFAULT 0
- medida_venta_id UUID FK -> medida.id
- precio_venta NUMERIC(12,2)

Índices:
- INDEX(articulo_id)
- INDEX(medida_id)
- INDEX(espacio_id)

Restricciones:
- UNIQUE(articulo_id, medida_id)
- CHECK(stock >= 0)
- CHECK(precio_venta >= 0)

Relaciones:
- N:1 articulo
- N:1 medida
- N:1 espacio

---

## proveedor

Campos:
- id UUID PK
- nombre VARCHAR(100)
- apellido VARCHAR(100)
- telefono VARCHAR(30)
- direccion VARCHAR(255)

Índices:
- INDEX(nombre)

Relaciones:
- 1:N lista_precios

---

## lista_precios

Campos:
- id UUID PK
- articulo_id UUID FK -> articulo.id
- proveedor_id UUID FK -> proveedor.id
- id_articulo_proveedor VARCHAR(100)
- precio_lista NUMERIC(12,2)

Restricciones:
- UNIQUE(proveedor_id, articulo_id)
- CHECK(precio_lista >= 0)

Índices:
- INDEX(articulo_id)
- INDEX(proveedor_id)

Relaciones:
- N:1 articulo
- N:1 proveedor

---

# Relaciones generales

- rol 1:N usuario
- categoria 1:N articulo
- articulo 1:N inventario
- medida 1:N inventario
- deposito 1:N espacio
- espacio 1:N inventario
- proveedor 1:N lista_precios
- articulo 1:N lista_precios

---

# Reglas Globales

- Integridad referencial obligatoria.
- No permitir stock negativo.
- No eliminar físicamente registros salvo necesidad.
- Generar modelos SQLAlchemy 2.0, Alembic, Pydantic CRUD y relaciones bidireccionales.
