# Proyecto DAW - Aplicación Full Stack

**[Read in English](docs/README_EN.md)**

Una aplicación web full-stack moderna construida con React y Node.js, desarrollada como parte del curso DAW (Desarrollo de Aplicaciones Web). Este proyecto demuestra prácticas profesionales de desarrollo web incluyendo diseño de API RESTful, containerización con Docker y un flujo de trabajo completo listo para CI/CD.

## Descripción General

Esta aplicación se compone de la parte frontend y la parte de backend. El backend proporciona una API REST robusta construida con Express.js y MySQL, mientras que el frontend ofrece una interfaz de usuario responsiva usando React y Next.js para un rendimiento óptimo. Todo el stack está containerizado usando Docker, permitiendo entornos de desarrollo y despliegue consistentes.

## Sobre el Proyecto

Para entender la visión completa del proyecto, casos de uso y arquitectura del sistema:

- **[Visión del Proyecto (Español)](docs/PROJECT_OVERVIEW_ES.md)** - Descripción detallada de la plataforma de monitoreo de sensores industriales

## Stack Tecnológico

### Backend

- **Node.js** con **Express.js** - Servidor API REST
- **MySQL 8.0** con **Sequelize** - Base de datos y ORM
- **CORS** - Cross-Origin Resource Sharing
- **dotenv** - Gestión de variables de entorno

### Frontend

- **React** - Biblioteca de UI
- **Next.js** - Framework React para producción
- **Vite** - Herramienta de compilación y servidor de desarrollo

### DevOps

- **Docker** & **Docker Compose** - Containerización
- **Makefile** - Automatización de comandos
- **GitHub Actions** - Pipelines CI/CD
- **AWS** - Infraestructura de despliegue en la nube
  - **S3** - Alojamiento estático del frontend
  - **EC2** - Servidor API backend
  - **CloudFront** - CDN y origen unificado

## Despliegue en la Nube

### Arquitectura Actual (Production)

```
┌─────────────────────────────────────────────────────────────┐
│                        Vercel CDN                           │
│                    (Frontend - Next.js)                     │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ↓ (API calls to)
┌──────────────────────────────────────────────────────────────┐
│           Azure App Service (Web App)                        │
│          (Backend - Node.js Express API)                     │
│          pi-backend.azurewebsites.net                        │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ↓ (Database connection)
┌──────────────────────────────────────────────────────────────┐
│        Azure Database for MySQL (Managed Instance)           │
│               (Production Database)                          │
└──────────────────────────────────────────────────────────────┘
```

### Componentes Desplegados

| Componente | Plataforma | URL | Estado |
|-----------|-----------|-----|--------|
| **Frontend** | Vercel | `https://daw-pi-iava.vercel.app` | ✅ Producción |
| **Backend** | Azure App Service | `https://pi-backend.azurewebsites.net` | ✅ Producción |
| **Base de Datos** | Azure MySQL | `projecte-db.mysql.database.azure.com` | ✅ Producción |

---

### Documentación de Despliegue

Para información más detallada sobre la arquitectura de despliegue en AWS (previamente usado):

- **[Documentación de Despliegue AWS (Español)](docs/AWS_DEPLOYMENT_ES.md)**
- **[AWS Deployment Documentation (English)](docs/AWS_DEPLOYMENT_EN.md)**

## Requisitos Previos

Antes de configurar el proyecto, asegúrate de tener instalado lo siguiente:

- [Node.js](https://nodejs.org/) (v18 o superior recomendado)
- [Docker](https://www.docker.com/) & Docker Compose
- [Make](https://www.gnu.org/software/make/) (generalmente preinstalado en Linux/macOS)

## Estructura del Proyecto

```
daw.pi.iava/
├── backend/          # API Express.js
├── frontend/         # Aplicación React
├── docker-compose.yml       # Configuración Docker de producción
├── docker-compose.dev.yml   # Configuración Docker de desarrollo
├── makefile         # Comandos de compilación y despliegue
├── .env             # Variables de entorno (no en git)
└── .env.example     # Variables de entorno de ejemplo
```

## Instalación y Configuración

### 1. Clonar el Repositorio

```bash
git clone https://github.com/juandiegombr/daw.pi.iava.git
cd daw.pi.iava
```

### 2. Configurar Variables de Entorno

Copia el archivo de ejemplo de entorno y configúralo:

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales de MySQL (opcional - los valores de ejemplo funcionan para desarrollo):

```env
MYSQL_USER=example-user
MYSQL_PASSWORD=example-password
MYSQL_ROOT_PASSWORD=example-password
MYSQL_DATABASE=example-database
```

### 3. Elige tu Método de Configuración

Puedes ejecutar este proyecto de dos maneras:

#### Opción A: Usando Docker (Recomendado)

**Modo Desarrollo** (con recarga en caliente):

```bash
make dev-build    # Construir contenedores
make dev-up       # Iniciar en modo separado
# o
make dev-upf      # Iniciar en modo primer plano
```

**Modo Producción**:

```bash
make prod-build   # Construir contenedores
make prod-up      # Iniciar en modo separado
# o
make prod-upf     # Iniciar en modo primer plano
```

#### Opción B: Desarrollo Local (sin Docker)

**Backend**:

```bash
cd backend
npm install
npm run dev       # Iniciar con nodemon (auto-recarga)
```

**Frontend**:

```bash
cd frontend
npm install
npm run dev       # Iniciar servidor de desarrollo Next.js
```

**MySQL**:
Necesitarás ejecutar MySQL 8.0 localmente. Asegúrate de que esté escuchando en `localhost:3306` con las credenciales definidas en tu archivo `.env`.

## Comandos Disponibles

### Comandos Makefile

Este proyecto usa **Make** como una forma estándar de organizar y documentar comandos de desarrollo. Make proporciona una interfaz consistente para tareas comunes en diferentes proyectos y es ampliamente adoptado en flujos de trabajo de desarrollo profesional.

Para ver todos los comandos disponibles con descripciones, ejecuta:

```bash
make help
```

Esto mostrará una lista formateada de todos los objetivos disponibles incluyendo comandos para construir, iniciar, detener y monitorear entornos de desarrollo y producción.

### Scripts NPM

**Backend** (`backend/package.json`):

- `npm start` - Ejecutar backend en modo producción
- `npm run dev` - Ejecutar backend con nodemon (desarrollo)

**Frontend** (`frontend/package.json`):

- `npm run dev` - Iniciar servidor de desarrollo Next.js
- `npm run build` - Compilar para producción
- `npm start` - Ejecutar servidor de producción

## Acceder a la Aplicación

Una vez en ejecución, puedes acceder a:

- **Frontend**: http://localhost:3001 (servidor de desarrollo Next.js)
- **API Backend**: http://localhost:3000
- **MySQL**: localhost:3306

Probar la API backend:

```bash
curl http://localhost:3000/api/sensors
```

Respuesta esperada (ejemplo):

```json
{
  "sensors": [
    {
      "id": 1,
      "name": "Sensor 1",
      "location": "Location",
      "type": "temperature"
    }
  ]
}
```

## Solución de Problemas

### Problemas con Docker

**¿Backend no puede conectarse a la base de datos?**

El backend utiliza health checks para esperar a que MySQL esté completamente inicializado antes de intentar conectarse. Si encuentras errores de conexión:

```bash
make dev-down
make dev-rebuild
```

Esto fuerza la reconstrucción de los contenedores y asegura que los health checks funcionen correctamente.

**¿Contenedores no inician?**

```bash
make dev-down
make dev-rebuild
```

**Verificar logs:**

```bash
make logs-dev-backend
```

**Limpiar recursos Docker:**

```bash
docker system prune -a
```

### Puerto Ya en Uso

Si obtienes un error "port already in use", puedes:

- Detener el proceso en conflicto
- Cambiar el puerto en el archivo Docker Compose
- Cambiar el PORT en tu archivo `.env`

---

## Troubleshooting - Producción

### Frontend no se conecta al Backend

**Síntomas:**
- Errores 503/504 en Vercel
- API calls devuelven 404

**Soluciones:**
1. Verificar `API_URL` en Vercel → Settings → Environment Variables
2. Comprobar que el backend está corriendo: `https://pi-backend.azurewebsites.net/api/sensors`
3. Revisar logs de Azure: App Service → Log stream

### Backend no inicia en Azure

**Síntomas:**
- Status: Stopped o Failed
- SSH: Connection closed

**Soluciones:**
1. Verificar variables de entorno MySQL están configuradas
2. Verificar conexión a Azure MySQL:
   ```bash
   mysql -h projecte-db.mysql.database.azure.com -u juandiegombr -p
   ```
3. Revisar logs: App Service → Log stream
4. Reiniciar App Service: Restart button en Azure Portal

### Base de Datos no accesible

**Síntomas:**
- Backend no puede conectar a MySQL
- Error: "connect ETIMEDOUT"

**Soluciones:**
1. Verificar firewall de Azure MySQL permite App Service
2. Verificar credenciales MySQL en variables de entorno
3. Comprobar que el servidor MySQL está "Available" en Azure Portal

## Flujo de Trabajo de Desarrollo

1. Iniciar el entorno de desarrollo: `make dev-up`
2. Realizar cambios en tu código (recarga en caliente habilitada)
3. Probar tus cambios
4. Ver logs si es necesario: `make logs-dev-backend`
5. Detener cuando termines: `make dev-down`

---

## Despliegue a Producción

### Frontend (Vercel)

El frontend se despliega automáticamente a Vercel mediante GitHub Actions:

1. **Configuración Inicial:**
   - Conectar repositorio GitHub a Vercel
   - Vercel detecta automáticamente Next.js
   - Configurar raíz de proyecto: `frontend`

2. **Variables de Entorno:**
   - `API_URL` → URL del backend (ej: `https://pi-backend.azurewebsites.net`)

3. **Despliegue:**
   - Empuja a `main` → Vercel construye y despliega automáticamente
   - URL: `https://daw-pi-iava.vercel.app`

### Backend (Azure App Service)

El backend se despliega automáticamente a Azure mediante GitHub Actions:

1. **Configuración Inicial:**
   ```bash
   # Crear App Service
   - Nombre: pi-backend
   - Runtime: Node 22
   - OS: Linux
   - Plan: Básico o Superior
   ```

2. **Variables de Entorno:**
   - `MYSQL_HOST` → Servidor Azure MySQL
   - `MYSQL_USER` → Usuario MySQL
   - `MYSQL_PASSWORD` → Contraseña MySQL
   - `MYSQL_DATABASE` → Nombre de base de datos
   - `PORT` → 3000 (predeterminado)

3. **Despliegue:**
   - Empuja a `main` → GitHub Actions construye y despliega
   - URL: `https://pi-backend.azurewebsites.net`

### Base de Datos (Azure MySQL)

1. **Creación:**
   ```bash
   - Tipo: Azure Database for MySQL - Flexible Server
   - Nombre: projecte-db
   - Admin: juandiegombr
   - Región: Spain Central
   ```

2. **Inicializar Tablas:**
   ```bash
   # Conectar a Azure MySQL
   mysql -h projecte-db.mysql.database.azure.com -u juandiegombr -p

   # Las tablas se crean automáticamente cuando el backend inicia
   # (Sequelize sync)
   ```

3. **Configuración de Firewall:**
   - Permitir conexiones desde Azure App Service
   - Permitir conexiones desde tu IP local (desarrollo)

## Licencia

ISC

## Autor

Juan Diego Martín-Blas Ramos
