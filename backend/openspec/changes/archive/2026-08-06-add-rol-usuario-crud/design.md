## Context

El backend está scaffold vacío: solo existen `app/main.py` (vacío) y los
`__init__.py`. El esquema de datos viene definido en `docs/db_schema.md`
(tablas `rol` y `usuario`). No existe aún infraestructura común (config,
database, seguridad, manejo de errores), por lo que este cambio además de los
CRUD debe asentar las bases mínimas que ambas entidades comparten. Ver
proposal.md para la motivación y los specs (`rol-crud`, `usuario-crud`) para
los requisitos de comportamiento.

La arquitectura comprometida en AGENTS.md es por capas:
Router → Service → Repository → SQLAlchemy → PostgreSQL. Los routers nunca
tocan la base de datos; la lógica de negocio vive en Services; los
Repositories solo hacen CRUD y consultas.

## Goals / Non-Goals

**Goals:**
- Implementar el CRUD completo de `rol` y `usuario` siguiendo la arquitectura
  por capas del proyecto.
- Modelos SQLAlchemy 2.0 en singular (`Rol`, `Usuario`, tablas `rol`,
  `usuario`), con soft delete y timestamps de auditoría.
- Baja lógica vía `deleted_at` en ambas entidades (no borrado físico, según
  reglas globales de db_schema.md).
- Hash de contraseña en el Service; el hash nunca se expone en respuestas.
- Proveer la infraestructura mínima (base, sesión, config) que los CRUD
  requieren para ser funcionales y testeables.

**Non-Goals:**
- Autenticación JWT.

## Decisions

### 1. Baja lógica sin filtro a nivel query (soft delete manual en capa de datos)
Se implementa `deleted_at` como columna `nullable` y toda consulta del
repositorio filtra `deleted_at.is_(None)`. Alternativa considerada: mixin de
soft delete con prefiltrado automático. Se elige el filtro explícito en el
repository por simplicidad y predictibilidad, dejando el mixin como mejora
futura si se repite en más entidades.

### 2. Has de contraseña en el Service
El Service de Usuario recibe `password` en texto plano y produce
`password_hash` con un esquema de hashing seguro antes de delegar al
Repository. El Repository nunca conoce la contraseña en claro. Esquemas
Pydantic de respuesta (`UsuarioOut`) excluyen `password_hash`
`form_config`. Alternativa rechazadas: asignar el hash en el Repository
(rompe separación de responsabilidades) o devolver el hash en las
respuestas (viola el spec de seguridad).

### 3. `UUID` como PK con timestamps en base
Siguiendo db_schema.md, todas las PK son UUID y todas las tablas llevan
`created_at`, `updated_at`, `deleted_at`. No se usan los índices separados
`INDEX(nombre)` para rol ni `UNIQUE(name)`; la unidad del `nombre` y del
`email` se impone por constraint de base de datos y se valida además a nivel
de servicio (HTTP 409) para devolver errores de dominio legibles.

### 4. Relaciones bidireccionales
`Usuario.role` (N:1) y `Rol.usuarios` (1:N) se declaran con
`relationship()` en ambos modelos, con `back_populates`, cumpliendo la regla
de relaciones bidireccionales de db_schema.md.

## Risks / Trade-offs

- **Soft delete y constraints únicos** → Al mantener `email`/`nombre` con
  `UNIQUE`, un usuario eliminado lógicamente conserva el valor y bloquea una
  futura re-creación. Mitigación: se valida el conflicto contra todos los
  registros (incluidos eliminados) para dar 409 claro; si el negocio lo exige,
  se evaluará un índice parcial (`WHERE deleted_at IS NULL`).
- **Infraestructura mínima creada ad hoc** → Como el scaffold están vacío, se
  crea un `Base(DeclarativeBase)` y una fábrica de sesión simples. Mitigación:
  mantenerlos en `app/core/` para que migraciones y tests los consuman.
- **UUID vs serial** → UUID agrega complejidad en las FK, pero cumple la
  convención del esquema y evita enumerables adivinables.