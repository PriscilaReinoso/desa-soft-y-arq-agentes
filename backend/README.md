# Sistema de Gestión de Inventario para Ferretería - Backend API

API REST para el sistema de gestión de inventario de una ferretería. Permite administrar artículos, depósitos, ventas, proveedores, listas de precios, preventas y presupuestos (exportables a PDF), además de integrar un asistente inteligente para consultas sobre inventario, productos similares y sugerencias de compra.

---

## 🛠️ Stack Tecnológico

- **Lenguaje**: Python 3.12+
- **Framework Web**: FastAPI
- **Validación y DTOs**: Pydantic v2 & Pydantic Settings
- **ORM & Base de Datos**: SQLAlchemy 2.0 + PostgreSQL (con `pgvector` para búsqueda semántica)
- **Migraciones**: Alembic
- **Servidor ASGI**: Uvicorn
- **Pruebas**: Pytest & HTTPX

---

## 📁 Estructura del Proyecto

```text
backend/
├── app/
│   ├── main.py              # Punto de entrada de FastAPI y configuración de routers
│   ├── api/
│   │   └── v1/              # Routers y endpoints REST organizados por versión
│   ├── core/                # Configuración, conexión a DB, seguridad y utilidades core
│   ├── exceptions/          # Manejo centralizado de errores de dominio y HTTP
│   ├── middleware/          # Middlewares personalizados (logging, auditoría, etc.)
│   ├── models/              # Modelos ORM de SQLAlchemy (mapeo a tablas de DB)
│   ├── repositories/        # Capa de acceso a datos y consultas DB
│   ├── schemas/             # Esquemas Pydantic para validación de requests/responses
│   ├── services/            # Capa de servicios y lógica de negocio
│   └── utils/               # Funciones auxiliares y generadores (PDF, Excel, etc.)
├── alembic/                 # Control de versiones y scripts de migración de DB
├── tests/                   # Suite de pruebas unitarias e integración con Pytest
├── .env.example             # Plantilla de variables de entorno
├── requirements.txt         # Lista de dependencias de Python
└── AGENTS.md                # Guía y convenciones del proyecto
```

---

## 🚀 Requisitos Previos

1. **Python 3.12+** instalado.
2. **PostgreSQL** (versión 15+ con extensión `pgvector` recomendada) en ejecución local o remota.

---

## ⚙️ Pasos de Instalación y Ejecución

### 1. Clonar el repositorio y posicionarse en la carpeta backend
```bash
cd backend
```

### 2. Crear y activar un entorno virtual

- **En Windows (PowerShell):**
  ```powershell
  python -m venv venv
  .\venv\Scripts\Activate.ps1
  ```

- **En Windows (CMD):**
  ```cmd
  python -m venv venv
  .\venv\Scripts\activate.bat
  ```

- **En Linux/macOS:**
  ```bash
  python3 -m venv venv
  source venv/bin/activate
  ```

### 3. Configurar variables de entorno

Copia el archivo `.env.example` para crear tu `.env` local:
```bash
copy .env.example .env
```
Edita `.env` con las credenciales correspondientes de tu base de datos PostgreSQL (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`).

### 4. Instalar dependencias
```bash
pip install -r requirements.txt
```

### 5. Aplicar migraciones a la Base de Datos
```bash
alembic upgrade head
```

### 6. Iniciar la aplicación
```bash
uvicorn app.main:app --reload
```

El servidor estará escuchando por defecto en `http://127.0.0.1:8000`.

---

## 📖 Documentación Interactiva de la API

Una vez en ejecución el servidor, puedes acceder a la documentación interactiva:

- **Swagger UI**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

---

## 🧪 Ejecutar Pruebas Automatizadas

Para ejecutar las pruebas del proyecto con `pytest`:

```bash
pytest
```

---

## 🛠️ Comandos Útiles de Alembic

- **Crear una nueva migración automática**:
  ```bash
  alembic revision --autogenerate -m "descripcion_del_cambio"
  ```
- **Aplicar migraciones pendientes**:
  ```bash
  alembic upgrade head
  ```
- **Revertir la última migración**:
  ```bash
  alembic downgrade -1
  ```
