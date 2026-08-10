# Sistema de Gestión de Inventario para Ferretería - Frontend

Aplicación web de gestión de inventario para ferretería desarrollada con **React**, **TypeScript**, **Vite** y **Tailwind CSS**. Permite administrar artículos, categorías, depósitos, inventario, ventas y proveedores, comunicándose con la API backend en FastAPI.

---

## 🛠️ Stack Tecnológico

- **Framework**: React 19
- **Lenguaje**: TypeScript
- **Herramienta de construcción & Dev Server**: Vite
- **Estilos**: Tailwind CSS v4
- **Manejo de Estado / Consultas HTTP**: TanStack Query (React Query)
- **Formularios**: React Hook Form
- **Enrutamiento**: React Router v7

---

## 📁 Estructura del Proyecto

```text
frontend/
├── src/
│   ├── components/          # Componentes de UI reutilizables
│   ├── context/             # Contextos globales (ej. Autenticación)
│   ├── hooks/               # Custom hooks de React
│   ├── pages/               # Vistas principales y páginas de la aplicación
│   ├── services/            # Servicios de llamadas HTTP a la API REST backend
│   ├── types/               # Definiciones de interfaces y tipos TypeScript
│   ├── App.tsx              # Configuración de rutas y layout principal
│   ├── main.tsx             # Punto de entrada principal de React
│   └── index.css            # Estilos globales y directivas Tailwind
├── index.html               # Plantilla HTML principal
├── vite.config.ts           # Configuración de Vite
├── package.json             # Dependencias y scripts de ejecución
└── AGENTS.md                # Convenciones y documentación técnica del frontend
```

---

## 🚀 Requisitos Previos

1. **Node.js** (versión 18+ recomendada). Puedes verificar tu versión ejecutando:
   ```bash
   node -v
   ```
2. **Backend en ejecución**: El backend debe estar ejecutándose en `http://127.0.0.1:8000` para procesar la autenticación y las peticiones a la API.

---

## ⚙️ Pasos de Instalación y Ejecución

### 2. Instalar las dependencias del proyecto
```bash
npm install
```

### 3. Iniciar el servidor de desarrollo
```bash
npm run dev
```

El servidor estará escuchando por defecto en **`http://localhost:5173`** (o en la URL/puerto indicado en la consola por Vite).

---

## 🛠️ Otros Comandos Útiles

- **Compilar para producción**:
  ```bash
  npm run build
  ```
- **Previsualizar la compilación de producción**:
  ```bash
  npm run preview
  ```
