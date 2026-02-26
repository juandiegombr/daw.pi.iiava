# DAW Project - Full Stack Application

**[Leer en Español](../README.md)**

A modern full-stack web application built with React and Node.js, developed as part of the DAW (Desarrollo de Aplicaciones Web) course. This project demonstrates professional web development practices including RESTful API design, containerization with Docker, and a complete CI/CD-ready development workflow.

## Overview

This application is composed of a frontend and a backend part. The backend provides a robust REST API built with Express.js and MySQL, while the frontend delivers a responsive user interface using React and Next.js for optimal performance. The entire stack is containerized using Docker, enabling consistent development and deployment environments.

## About the Project

To understand the full project vision, use cases, and system architecture:

- **[Project Overview (English)](PROJECT_OVERVIEW.md)** - Detailed overview of the industrial sensor monitoring platform

## Tech Stack

### Backend

- **Node.js** with **Express.js** - REST API server
- **MySQL 8.0** with **Sequelize** - Database and ORM
- **CORS** - Cross-Origin Resource Sharing
- **dotenv** - Environment variable management

### Frontend

- **React** - UI library
- **Next.js** - React framework for production
- **Vite** - Build tool and dev server

### DevOps

- **Docker** & **Docker Compose** - Containerization
- **Makefile** - Command automation
- **GitHub Actions** - CI/CD pipelines
- **Azure** - Cloud deployment infrastructure
  - **App Service** - Backend API server
  - **Azure Database for MySQL** - Managed database
- **Vercel** - Frontend hosting with global CDN

## Cloud Deployment

### Current Production Architecture

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
│   pi-backend-ahdch5g9ghajbjh3.spaincentral-01.azure...      │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ↓ (Database connection)
┌──────────────────────────────────────────────────────────────┐
│        Azure Database for MySQL (Managed Instance)           │
│               (Production Database)                          │
└──────────────────────────────────────────────────────────────┘
```

### Deployed Components

| Component | Platform | URL | Status |
|-----------|----------|-----|--------|
| **Frontend** | Vercel | [https://daw-pi-iiava.vercel.app](https://daw-pi-iiava.vercel.app) | ✅ Production |
| **Backend** | Azure App Service | [https://projecte-iiava-backend-eue7f0eghzakbkcd.spaincentral-01.azurewebsites.net](https://projecte-iiava-backend-eue7f0eghzakbkcd.spaincentral-01.azurewebsites.net) | ✅ Production |
| **Database** | Azure MySQL | `projecte-db.mysql.database.azure.com` | ✅ Production |

---

### Deployment Documentation

For more detailed information about the Azure deployment architecture:

- **[Azure Deployment Documentation (English)](AZURE_DEPLOYMENT_EN.md)**
- **[Documentación de Despliegue Azure (Español)](AZURE_DEPLOYMENT_ES.md)**

## Prerequisites

Before setting up the project, make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [Docker](https://www.docker.com/) & Docker Compose
- [Make](https://www.gnu.org/software/make/) (usually pre-installed on Linux/macOS)

## Project Structure

```
daw.pi.iiava/
├── backend/          # Express.js API
├── frontend/         # React application
├── docker-compose.yml       # Production Docker configuration
├── docker-compose.dev.yml   # Development Docker configuration
├── makefile         # Build and deployment commands
├── .env             # Environment variables (not in git)
└── .env.example     # Example environment variables
```

## Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/juandiegombr/daw.pi.iiava.git
cd daw.pi.iiava
```

### 2. Configure Environment Variables

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit the `.env` file with your MySQL credentials (optional - example values work for development):

```env
MYSQL_USER=example-user
MYSQL_PASSWORD=example-password
MYSQL_ROOT_PASSWORD=example-password
MYSQL_DATABASE=example-database
```

### 3. Choose Your Setup Method

You can run this project in two ways:

#### Option A: Using Docker (Recommended)

**Development Mode** (with hot reload):

```bash
make dev-build    # Build containers
make dev-up       # Start in detached mode
# or
make dev-upf      # Start in foreground mode
```

**Production Mode**:

```bash
make prod-build   # Build containers
make prod-up      # Start in detached mode
# or
make prod-upf     # Start in foreground mode
```

#### Option B: Local Development (without Docker)

**Backend**:

```bash
cd backend
npm install
npm run dev       # Start with nodemon (auto-reload)
```

**Frontend**:

```bash
cd frontend
npm install
npm run dev       # Start Next.js dev server
```

**MySQL**:
You'll need to run MySQL 8.0 locally. Make sure it's listening on `localhost:3306` with the credentials defined in your `.env` file.

## Available Commands

### Makefile Commands

This project uses **Make** as a standard way to organize and document development commands. Make provides a consistent interface for common tasks across different projects and is widely adopted in professional development workflows.

To see all available commands with descriptions, run:

```bash
make help
```

This will display a formatted list of all available targets including commands for building, starting, stopping, and monitoring both development and production environments.

### NPM Scripts

**Backend** (`backend/package.json`):

- `npm start` - Run backend in production mode
- `npm run dev` - Run backend with nodemon (development)

**Frontend** (`frontend/package.json`):

- `npm run dev` - Start Next.js dev server
- `npm run build` - Build for production
- `npm start` - Start production server

## Accessing the Application

Once running, you can access:

- **Frontend**: http://localhost:3001 (Next.js dev server)
- **Backend API**: http://localhost:3000
- **MySQL**: localhost:3306

Test the backend API:

```bash
curl http://localhost:3000/api/sensors
```

Expected response (example):

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

## Development Workflow

1. Start the development environment: `make dev-up`
2. Make changes to your code (hot reload is enabled)
3. Test your changes
4. View logs if needed: `make logs-dev-backend`
5. Stop when done: `make dev-down`

---

## Production Deployment

### Frontend (Vercel)

The frontend automatically deploys to Vercel via GitHub Actions:

1. **Initial Setup:**
   - Connect GitHub repository to Vercel
   - Vercel automatically detects Next.js
   - Configure project root: `frontend`

2. **Environment Variables:**
   - `API_URL` → Backend URL (e.g., `https://projecte-iiava-backend-eue7f0eghzakbkcd.spaincentral-01.azurewebsites.net`)

3. **Deployment:**
   - Push to `main` → Vercel builds and deploys automatically
   - URL: `https://daw-pi-iiava.vercel.app`

### Backend (Azure App Service)

The backend automatically deploys to Azure via GitHub Actions:

1. **Initial Setup:**
   ```bash
   # Create App Service
   - Name: pi-backend
   - Runtime: Node 22
   - OS: Linux
   - Plan: Basic or higher
   ```

2. **Environment Variables:**
   - `MYSQL_HOST` → Azure MySQL server
   - `MYSQL_USER` → MySQL username
   - `MYSQL_PASSWORD` → MySQL password
   - `MYSQL_DATABASE` → Database name
   - `PORT` → 3000 (default)

3. **Deployment:**
   - Push to `main` → GitHub Actions builds and deploys
   - URL: `https://projecte-iiava-backend-eue7f0eghzakbkcd.spaincentral-01.azurewebsites.net`

### Database (Azure MySQL)

1. **Creation:**
   ```bash
   - Type: Azure Database for MySQL - Flexible Server
   - Name: projecte-db
   - Admin: juandiegombr
   - Region: Spain Central
   ```

2. **Initialize Tables:**
   ```bash
   # Connect to Azure MySQL
   mysql -h projecte-db.mysql.database.azure.com -u juandiegombr -p

   # Tables are automatically created when backend starts
   # (Sequelize sync)
   ```

3. **Firewall Configuration:**
   - Allow connections from Azure App Service
   - Allow connections from your local IP (development)

---

## Production Troubleshooting

### Frontend Cannot Connect to Backend

**Symptoms:**
- 503/504 errors on Vercel
- API calls return 404

**Solutions:**
1. Verify `API_URL` in Vercel → Settings → Environment Variables
2. Check backend is running: `https://projecte-iiava-backend-eue7f0eghzakbkcd.spaincentral-01.azurewebsites.net/api/sensors`
3. Review Azure logs: App Service → Log stream

### Backend Fails to Start on Azure

**Symptoms:**
- Status: Stopped or Failed
- SSH: Connection closed

**Solutions:**
1. Verify MySQL environment variables are configured
2. Verify MySQL connection:
   ```bash
   mysql -h projecte-db.mysql.database.azure.com -u juandiegombr -p
   ```
3. Review logs: App Service → Log stream
4. Restart App Service: Click Restart button in Azure Portal

### Database Connection Issues

**Symptoms:**
- Backend cannot connect to MySQL
- Error: "connect ETIMEDOUT"

**Solutions:**
1. Verify Azure MySQL firewall allows App Service
2. Verify MySQL credentials in environment variables
3. Check MySQL server is "Available" in Azure Portal

## License

ISC

## Author

Juan Diego Martín-Blas Ramos
