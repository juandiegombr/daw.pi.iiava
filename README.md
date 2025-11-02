# DAW Project - Full Stack Application

A modern full-stack web application built with React and Node.js, developed as part of the DAW (Desarrollo de Aplicaciones Web) course. This project demonstrates professional web development practices including RESTful API design, containerization with Docker, and a complete CI/CD-ready development workflow.

## Overview

This application follows a microservices-oriented architecture with a clear separation between frontend and backend services. The backend provides a robust REST API built with Express.js and MongoDB, while the frontend delivers a responsive user interface using React and Vite for optimal performance. The entire stack is containerized using Docker, enabling consistent development and deployment environments.

**Key Features:**
- RESTful API with Express.js and MongoDB/Mongoose ODM
- Modern React frontend with Vite for fast development and builds
- Dockerized development and production environments
- Hot module replacement (HMR) for rapid development
- Environment-based configuration management
- Makefile automation for common tasks

## Tech Stack

### Backend
- **Node.js** with **Express.js** - REST API server
- **MongoDB** with **Mongoose** - Database and ODM
- **CORS** - Cross-Origin Resource Sharing
- **dotenv** - Environment variable management

### Frontend
- **React** - UI library
- **Vite** - Build tool and dev server

### DevOps
- **Docker** & **Docker Compose** - Containerization
- **Makefile** - Command automation

## Prerequisites

Before setting up the project, make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [Docker](https://www.docker.com/) & Docker Compose
- [Make](https://www.gnu.org/software/make/) (usually pre-installed on Linux/macOS)

## Project Structure

```
daw.pi.iava/
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
git clone <repository-url>
cd daw.pi.iava
```

### 2. Configure Environment Variables

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit the `.env` file with your MongoDB credentials:

```env
MONGO_USER=your-mongo-user
MONGO_PASSWORD=your-mongo-password
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
npm run dev       # Start Vite dev server
```

**MongoDB**:
You'll need to run MongoDB locally or use a cloud service like MongoDB Atlas.

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
- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Accessing the Application

Once running, you can access:

- **Frontend**: http://localhost:5173 (Vite dev server)
- **Backend API**: http://localhost:3000
- **MongoDB**: localhost:27017

Test the backend API:
```bash
curl http://localhost:3000/
```

Expected response:
```json
{
  "data": {
    "message": "Hello world!"
  }
}
```

## Troubleshooting

### Docker Issues

**Containers not starting?**
```bash
make dev-down
make dev-rebuild
```

**Check logs:**
```bash
make logs-dev-backend
```

**Clean Docker resources:**
```bash
docker system prune -a
```

### Port Already in Use

If you get a "port already in use" error, you can:
- Stop the conflicting process
- Change the port in the Docker Compose file
- Change the PORT in your `.env` file

## Development Workflow

1. Start the development environment: `make dev-up`
2. Make changes to your code (hot reload is enabled)
3. Test your changes
4. View logs if needed: `make logs-dev-backend`
5. Stop when done: `make dev-down`

## License

ISC

## Author

DAW Student Project
