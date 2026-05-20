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
- **AWS** - Cloud deployment infrastructure (region `eu-west-1`)
  - **CloudFront** - Global CDN and single public entry point
  - **S3** - Static frontend hosting
  - **EC2** - Node.js backend running in a Docker container
  - **RDS MySQL** - Managed database

## Cloud Deployment

### Current Production Architecture

CloudFront is the single public entry point: it serves the frontend from S3 and routes `/api/*` to the backend on EC2.

```
                       ┌─────────────────────────┐
                       │     CloudFront (CDN)    │
                       │  d12lcsgk45eqvv.cloudfront.net
                       └────────────┬────────────┘
                                    │
                ┌───────────────────┴───────────────────┐
                │                                       │
        (default behavior)                       (/api/*)
                │                                       │
                ↓                                       ↓
   ┌──────────────────────────┐         ┌─────────────────────────────┐
   │  S3 (static)             │         │   EC2 + Docker              │
   │  daw-pi-iava-frontend    │         │   Node.js / Express :80→3000│
   └──────────────────────────┘         └──────────────┬──────────────┘
                                                       │
                                                       ↓
                                        ┌─────────────────────────────┐
                                        │     RDS MySQL 8.0           │
                                        └─────────────────────────────┘
```

### Deployed Components

| Component | Platform | URL / Identifier | Status |
|-----------|----------|------------------|--------|
| **Frontend / CDN** | CloudFront + S3 | [https://d12lcsgk45eqvv.cloudfront.net](https://d12lcsgk45eqvv.cloudfront.net) | ✅ Production |
| **Backend** | EC2 + Docker | `ec2-108-129-184-221.eu-west-1.compute.amazonaws.com` | ✅ Production |
| **Database** | RDS MySQL 8.0 | `daw.cjgqeq2gs0wl.eu-west-1.rds.amazonaws.com` | ✅ Production |

---

### Deployment Documentation

For more detailed information about the AWS deployment architecture:

- **[AWS Deployment Documentation (English)](AWS_DEPLOYMENT_EN.md)**
- **[Documentación de Despliegue AWS (Español)](AWS_DEPLOYMENT_ES.md)**

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

The entire infrastructure lives on AWS (`eu-west-1`). The full reference (resource creation, IAM, costs, troubleshooting) lives in [`AWS_DEPLOYMENT_EN.md`](AWS_DEPLOYMENT_EN.md). Summary:

### Frontend (S3 + CloudFront)

The frontend deploys automatically via GitHub Actions (`.github/workflows/frontend-deploy.yml`):

1. **Initial Setup:**
   - S3 bucket `daw-pi-iava-frontend` (Block Public Access enabled; CloudFront reads via OAC)
   - CloudFront distribution `E8CAZK17RKQ5Z`
   - `/api/*` behavior routes to the EC2 origin

2. **Deployment:**
   - Push to `main` touching `frontend/**` → build, `aws s3 sync`, `cloudfront create-invalidation /*`
   - URL: `https://d12lcsgk45eqvv.cloudfront.net`

### Backend (EC2 + Docker)

The backend deploys automatically via GitHub Actions (`.github/workflows/backend-deploy.yml`):

1. **Initial Setup:**
   ```bash
   # EC2 instance with Docker
   - AMI: Amazon Linux 2023
   - Type: t3.micro
   - Region: eu-west-1
   - Security group: 22/tcp (admin) and 80/tcp (CloudFront)
   ```

2. **Environment Variables** (in `~/daw.pi.iiava/backend/.env` on the EC2 host):
   - `MYSQL_HOST` → RDS endpoint
   - `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`
   - `PORT` → 3000 (mapped to host port 80)
   - `JWT_SECRET`

3. **Deployment:**
   - Push to `main` touching `backend/**` → SSH to EC2, `git pull`, `docker build`, container restart, `/api/*` invalidation in CloudFront
   - Host: `ec2-108-129-184-221.eu-west-1.compute.amazonaws.com`

### Database (RDS MySQL)

1. **Creation:**
   ```bash
   - Engine: MySQL 8.0 (RDS)
   - Identifier: daw
   - Instance: db.t3.micro
   - Region: eu-west-1
   ```

2. **Initialize Tables:**
   ```bash
   # Connect to RDS
   mysql -h daw.cjgqeq2gs0wl.eu-west-1.rds.amazonaws.com -u admin -p

   # Tables are automatically created when backend starts
   # (Sequelize sync)
   ```

3. **Security Group Configuration:**
   - Allow connections from the EC2 security group on `3306`
   - Allow connections from your local IP (development) if needed

---

## Production Troubleshooting

### Frontend Cannot Reach Backend

**Symptoms:**
- 502/504 errors from CloudFront
- API calls return 404 or 5xx

**Solutions:**
1. SSH to EC2 and check the container is running: `docker ps`, `docker logs backend-container`
2. Check backend directly at the origin: `curl http://ec2-108-129-184-221.eu-west-1.compute.amazonaws.com/api/sensors`
3. Verify the CloudFront `/api/*` behavior points at the EC2 origin and has `CachingDisabled` + `AllViewer` origin request policy

### Backend Fails to Start on EC2

**Symptoms:**
- Container exits immediately (`docker ps -a` shows it stopped)

**Solutions:**
1. `docker logs backend-container` for the error
2. Verify `~/daw.pi.iiava/backend/.env` exists with valid RDS credentials
3. Test the RDS connection from EC2:
   ```bash
   mysql -h daw.cjgqeq2gs0wl.eu-west-1.rds.amazonaws.com -u admin -p
   ```
4. Restart by re-running the GitHub Actions workflow or manually:
   ```bash
   docker rm -f backend-container && docker run -d -p 80:3000 --name backend-container --env-file .env --restart unless-stopped backend
   ```

### Database Connection Issues

**Symptoms:**
- Backend cannot connect to MySQL
- Error: "connect ETIMEDOUT"

**Solutions:**
1. Verify the RDS security group allows the EC2 security group on `3306`
2. Verify MySQL credentials in `~/daw.pi.iiava/backend/.env`
3. Confirm the RDS instance is "Available" in the AWS console

## License

ISC

## Author

Juan Diego Martín-Blas Ramos
