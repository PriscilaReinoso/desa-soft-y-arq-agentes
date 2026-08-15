---
name: control-security
description: Auditar el proyecto para detectar exposición o manejo inseguro de secretos (contraseñas, tokens, API keys, JWT secrets, credenciales de base de datos, .env, connection strings, claves privadas). Use when the user asks to audit, scan or review the codebase for security issues, hardcoded secrets, credentials, passwords, tokens, API keys, .env exposure or insecure secret handling. Read-only: only analyzes and reports; never modifies files.
---

# Security Audit

## Objetivo

Auditar el proyecto para detectar exposición o manejo inseguro de:

* contraseñas;
* API keys;
* tokens;
* JWT secrets;
* credenciales de bases de datos;
* claves privadas;
* connection strings;
* cualquier otro secreto.

La auditoría debe adaptarse automáticamente a la estructura y tecnologías presentes en el proyecto.

**No modificar archivos.** Esta skill solamente analiza e informa.

---

## 1. Secretos hardcodeados

Buscar secretos escritos directamente en:

* código fuente;
* archivos de configuración;
* scripts;
* tests;
* fixtures;
* Dockerfiles;
* Docker Compose;
* archivos JSON/YAML/TOML;
* documentación y ejemplos.

Detectar especialmente:

```text
password
passwd
pwd
secret
token
api_key
apikey
access_token
refresh_token
client_secret
private_key
database_url
connection_string
```

También buscar connection strings y credenciales embebidas, por ejemplo:

```text
postgresql://user:password@host/db
mysql://user:password@host/db
mongodb://user:password@host/db
```

No marcar como vulnerabilidad valores claramente ficticios como:

```text
<YOUR_API_KEY>
example-password
your-password-here
```

si el contexto confirma que son solamente placeholders.

---

## 2. Variables de entorno

Verificar que las credenciales reales provengan de variables de entorno o de un mecanismo seguro equivalente.

Preferir:

```python
DB_PASSWORD = os.environ["DB_PASSWORD"]
```

o el mecanismo equivalente del framework.

Detectar defaults inseguros:

```python
DB_PASSWORD = os.getenv("DB_PASSWORD", "valor")
```

No considerar seguro un secreto solamente porque esté dentro de una variable llamada `SECRET`, `PASSWORD`, etc.

Verificar también que los secretos no se impriman ni se devuelvan posteriormente.

---

## 3. `.env`

Si existe `.env`:

* comprobar que no contenga valores destinados a ser versionados;
* comprobar que esté excluido de Git;
* comprobar que no se copie a imágenes Docker.

Si existe `.env.example`:

* puede contener nombres de variables;
* puede contener placeholders;
* no debe contener secretos reales.

---

## 4. Git

Si Git está disponible, comprobar:

```bash
git status
git ls-files
```

Buscar archivos sensibles versionados, especialmente:

```text
.env
.env.*
credentials.json
secrets.json
*.pem
*.key
```

Si se detecta un secreto real que pudo haber sido committeado:

* marcarlo como vulnerabilidad;
* recomendar rotarlo/revocarlo;
* indicar que eliminarlo del archivo actual no elimina su exposición histórica.

No intentar limpiar el historial automáticamente.

---

## 5. Docker

Si existe `Dockerfile`, revisar:

* `ARG` con secretos;
* `ENV` con secretos;
* `COPY` de `.env`;
* archivos sensibles incluidos en la imagen.

Ejemplo inseguro:

```dockerfile
ENV DB_PASSWORD=password123
```

Verificar `.dockerignore`.

Como mínimo debería excluir:

```text
.env
.env.*
.git
```

Si existe Docker Compose, verificar que los secretos no estén hardcodeados:

```yaml
environment:
  DB_PASSWORD: password123
```

Preferir referencias a variables de entorno o mecanismos de secrets apropiados.

---

## 6. Logs y errores

Buscar exposición de secretos mediante:

```text
print
logging
logger
console.log
debug
exception
```

Prestar especial atención a:

* variables de entorno;
* headers HTTP;
* `Authorization`;
* cookies;
* request/response completos;
* connection strings;
* objetos de configuración.

No debe existir código que pueda registrar contraseñas, tokens, API keys o secretos.

---

## 7. APIs y respuestas

Revisar endpoints, serializers, schemas, DTOs y respuestas.

Detectar casos donde se pueda devolver accidentalmente:

```python
return settings.model_dump()
```

o:

```python
return config
```

si contienen secretos.

Los secretos nunca deben aparecer en:

* respuestas HTTP;
* endpoints de debugging;
* endpoints administrativos innecesarios;
* mensajes de error.

---

## 8. MCP

Si el proyecto utiliza MCP, revisar todas las tools.

Una tool MCP no debe devolver:

* contraseñas;
* API keys;
* tokens;
* JWT secrets;
* connection strings con credenciales;
* variables de entorno;
* contenido de `.env`;
* configuración interna que contenga secretos.

Prestar especial atención a funciones que devuelvan objetos completos de configuración.

---

## 9. Frontend

Si existe frontend, verificar que ningún secreto privado termine expuesto al cliente.

Prestar especial atención a variables destinadas explícitamente al frontend, por ejemplo:

```text
VITE_
NEXT_PUBLIC_
REACT_APP_
PUBLIC_
```

Una API key privada o secreto incluido en estas variables debe marcarse como vulnerabilidad.

---

## 10. Tests y scripts

Revisar:

```text
tests/
fixtures/
scripts/
tools/
migrations/
seed/
```

No deben utilizar credenciales reales.

Preferir:

* mocks;
* valores ficticios;
* variables de entorno específicas;
* secretos proporcionados por CI/CD.

---

## 11. Secret scanners

Si ya están instalados en el proyecto, utilizar herramientas como:

```text
gitleaks
trufflehog
detect-secrets
```

No instalar herramientas automáticamente.

Los resultados de estas herramientas deben analizarse junto con el código para reducir falsos positivos.

---

## 12. Protección durante la auditoría

La propia auditoría nunca debe exponer secretos.

Si se encuentra:

```text
API_KEY=sk-xxxxxxxxxxxx
```

el informe debe mostrar:

```text
API_KEY=[REDACTED]
```

Nunca mostrar secretos completos en la respuesta.

No imprimir `.env` completo ni `os.environ`.

---

## 13. Severidad

Clasificar los hallazgos:

### CRITICAL

* secreto real expuesto públicamente;
* API key real;
* private key;
* credencial de producción;
* secreto accesible mediante una API/MCP tool;
* secreto expuesto al frontend.

### HIGH

* contraseña hardcodeada;
* JWT secret hardcodeado;
* `.env` versionado;
* secreto dentro de Dockerfile/imagen;
* secretos registrados en logs.

### MEDIUM

* defaults inseguros;
* configuración potencialmente peligrosa;
* logs que podrían contener información sensible;
* `.dockerignore` incompleto.

### LOW

* mejoras de configuración que no implican exposición directa.

---

## 14. Resultado

Al finalizar, devolver:

```text
# Security Audit

Status: PASS / PASS WITH WARNINGS / FAIL

Critical: X
High: X
Medium: X
Low: X

## Findings

### [SEVERITY] Título

File: path/to/file.py:123

Problem:
Descripción del problema.

Recommendation:
Cómo corregirlo.

## Checks

- Secrets hardcoded
- Environment variables
- .env / .gitignore
- Git
- Docker / .dockerignore
- Logs
- API responses
- MCP tools
- Frontend
- Tests / scripts
- Secret scanners
```

Adaptar `Checks` a las tecnologías realmente presentes.

---

## 15. Regla final

La auditoría debe responder fundamentalmente:

> ¿Existe algún camino por el cual un secreto real pueda quedar hardcodeado, versionado, incluido en una imagen, registrado en logs, devuelto por una API/MCP tool o expuesto al cliente?

Si existe, reportarlo.

**No modificar código automáticamente.**
**No revelar secretos encontrados.**
**No asumir que un secreto eliminado del código dejó de estar comprometido: si estuvo en Git, recomendar rotación.**
