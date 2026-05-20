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
- **AWS** - Infraestructura de despliegue en la nube (región `eu-west-1`)
  - **CloudFront** - CDN global y único punto de entrada público
  - **S3** - Alojamiento estático del frontend
  - **EC2** - Backend Node.js en contenedor Docker
  - **RDS MySQL** - Base de datos administrada

## Despliegue en la Nube

### Arquitectura Actual (Production)

CloudFront es el único punto de entrada: sirve el frontend desde S3 y enruta `/api/*` al backend en EC2.

```
                       ┌─────────────────────────┐
                       │     CloudFront (CDN)    │
                       │  d12lcsgk45eqvv.cloudfront.net
                       └────────────┬────────────┘
                                    │
                ┌───────────────────┴───────────────────┐
                │                                       │
        (por defecto)                            (/api/*)
                │                                       │
                ↓                                       ↓
   ┌──────────────────────────┐         ┌─────────────────────────────┐
   │  S3 (estático)           │         │   EC2 + Docker              │
   │  daw-pi-iava-frontend    │         │   Node.js / Express :80→3000│
   └──────────────────────────┘         └──────────────┬──────────────┘
                                                       │
                                                       ↓
                                        ┌─────────────────────────────┐
                                        │     RDS MySQL 8.0           │
                                        └─────────────────────────────┘
```

### Componentes Desplegados

| Componente | Plataforma | URL / Identificador | Estado |
|-----------|-----------|---------------------|--------|
| **Frontend / CDN** | CloudFront + S3 | [https://d12lcsgk45eqvv.cloudfront.net](https://d12lcsgk45eqvv.cloudfront.net) | ✅ Producción |
| **Backend** | EC2 + Docker | `ec2-108-129-184-221.eu-west-1.compute.amazonaws.com` | ✅ Producción |
| **Base de Datos** | RDS MySQL 8.0 | `daw.cjgqeq2gs0wl.eu-west-1.rds.amazonaws.com` | ✅ Producción |

---

### Documentación de Despliegue

Para información más detallada sobre la arquitectura de despliegue en AWS:

- **[Documentación de Despliegue AWS (Español)](docs/AWS_DEPLOYMENT_ES.md)**
- **[AWS Deployment Documentation (English)](docs/AWS_DEPLOYMENT_EN.md)**

## Requisitos Previos

Antes de configurar el proyecto, asegúrate de tener instalado lo siguiente:

- [Node.js](https://nodejs.org/) (v18 o superior recomendado)
- [Docker](https://www.docker.com/) & Docker Compose
- [Make](https://www.gnu.org/software/make/) (generalmente preinstalado en Linux/macOS)

## Estructura del Proyecto

```
daw.pi.iiava/
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
git clone https://github.com/juandiegombr/daw.pi.iiava.git
cd daw.pi.iiava
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

## Flujo de Trabajo de Desarrollo

1. Iniciar el entorno de desarrollo: `make dev-up`
2. Realizar cambios en tu código (recarga en caliente habilitada)
3. Probar tus cambios
4. Ver logs si es necesario: `make logs-dev-backend`
5. Detener cuando termines: `make dev-down`

---

## Despliegue a Producción

Toda la infraestructura vive en AWS (`eu-west-1`). El detalle completo (creación de recursos, IAM, costos, troubleshooting) está en [`docs/AWS_DEPLOYMENT_ES.md`](docs/AWS_DEPLOYMENT_ES.md). Resumen:

### Frontend (S3 + CloudFront)

El frontend se despliega automáticamente mediante GitHub Actions (`.github/workflows/frontend-deploy.yml`):

1. **Configuración Inicial:**
   - Bucket S3 `daw-pi-iava-frontend` (Block Public Access activo; CloudFront accede vía OAC)
   - Distribución CloudFront `E8CAZK17RKQ5Z`
   - Behavior `/api/*` enruta al origen EC2

2. **Despliegue:**
   - Push a `main` con cambios en `frontend/**` → build, `aws s3 sync` y `cloudfront create-invalidation /*`
   - URL: `https://d12lcsgk45eqvv.cloudfront.net`

### Backend (EC2 + Docker)

El backend se despliega automáticamente mediante GitHub Actions (`.github/workflows/backend-deploy.yml`):

1. **Configuración Inicial:**
   ```bash
   # Instancia EC2 con Docker
   - AMI: Amazon Linux 2023
   - Tipo: t3.micro
   - Región: eu-west-1
   - Security group: 22/tcp (admin) y 80/tcp (CloudFront)
   ```

2. **Variables de Entorno** (en `~/daw.pi.iiava/backend/.env` del host EC2):
   - `MYSQL_HOST` → endpoint RDS
   - `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`
   - `PORT` → 3000 (mapeado a 80 en el host)
   - `JWT_SECRET`

3. **Despliegue:**
   - Push a `main` con cambios en `backend/**` → SSH a EC2, `git pull`, `docker build`, reinicio del contenedor e invalidación de `/api/*` en CloudFront
   - Host: `ec2-108-129-184-221.eu-west-1.compute.amazonaws.com`

### Base de Datos (RDS MySQL)

1. **Creación:**
   ```bash
   - Motor: MySQL 8.0 (RDS)
   - Identifier: daw
   - Instancia: db.t3.micro
   - Región: eu-west-1
   ```

2. **Inicializar Tablas:**
   ```bash
   # Conectar a RDS
   mysql -h daw.cjgqeq2gs0wl.eu-west-1.rds.amazonaws.com -u admin -p

   # Las tablas se crean automáticamente cuando el backend inicia
   # (Sequelize sync)
   ```

3. **Configuración de Security Group:**
   - Permitir conexiones desde el security group de EC2 en `3306`
   - Permitir conexiones desde tu IP local (desarrollo) si lo necesitas

## Licencia

ISC

## Autor

Juan Diego Martín-Blas Ramos
