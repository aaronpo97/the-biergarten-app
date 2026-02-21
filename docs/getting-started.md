# Getting Started

This guide will help you set up and run The Biergarten App in your development
environment.

## Prerequisites

Before you begin, ensure you have the following installed:

- **.NET SDK 10+** - [Download](https://dotnet.microsoft.com/download)
- **Node.js 18+** - [Download](https://nodejs.org/)
- **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop)
  (recommended)
- **Java 8+** - Required for generating diagrams from PlantUML (optional)

## Quick Start with Docker (Recommended)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd the-biergarten-app
```

### 2. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.dev
```

Edit `.env.dev` with your configuration:

```bash
# Database (component-based for Docker)
DB_SERVER=sqlserver,1433
DB_NAME=Biergarten
DB_USER=sa
DB_PASSWORD=YourStrong!Passw0rd

# JWT Authentication
JWT_SECRET=your-secret-key-minimum-32-characters-required
```

> For a complete list of environment variables, see
> [Environment Variables](environment-variables.md).

### 3. Start the Development Environment

```bash
docker compose -f docker-compose.dev.yaml up -d
```

This command will:

- Start SQL Server container
- Run database migrations
- Seed initial data
- Start the API on http://localhost:8080

### 4. Access the API

- **Swagger UI**: http://localhost:8080/swagger
- **Health Check**: http://localhost:8080/health

### 5. View Logs

```bash
# All services
docker compose -f docker-compose.dev.yaml logs -f

# Specific service
docker compose -f docker-compose.dev.yaml logs -f api.core
```

### 6. Stop the Environment

```bash
docker compose -f docker-compose.dev.yaml down

# Remove volumes (fresh start)
docker compose -f docker-compose.dev.yaml down -v
```

## Manual Setup (Without Docker)

If you prefer to run services locally without Docker:

### Backend Setup

#### 1. Start SQL Server

You can use a local SQL Server instance or a cloud-hosted one. Ensure it's accessible and
you have the connection details.

#### 2. Set Environment Variables

```bash
# macOS/Linux
export DB_CONNECTION_STRING="Server=localhost,1433;Database=Biergarten;User Id=sa;Password=YourStrong!Passw0rd;TrustServerCertificate=True;"
export JWT_SECRET="your-secret-key-minimum-32-characters-required"

# Windows PowerShell
$env:DB_CONNECTION_STRING="Server=localhost,1433;Database=Biergarten;User Id=sa;Password=YourStrong!Passw0rd;TrustServerCertificate=True;"
$env:JWT_SECRET="your-secret-key-minimum-32-characters-required"
```

#### 3. Run Database Migrations

```bash
cd src/Core
dotnet run --project Database/Database.Migrations/Database.Migrations.csproj
```

#### 4. Seed the Database

```bash
dotnet run --project Database/Database.Seed/Database.Seed.csproj
```

#### 5. Start the API

```bash
dotnet run --project API/API.Core/API.Core.csproj
```

The API will be available at http://localhost:5000 (or the port specified in
launchSettings.json).

### Frontend Setup

> **Note**: The frontend is currently transitioning from its standalone Prisma/Postgres
> backend to the .NET API. Some features may still use the old backend.

#### 1. Navigate to Website Directory

```bash
cd Website
```

#### 2. Create Environment File

Create `.env.local` with frontend variables. See
[Environment Variables - Frontend](environment-variables.md#frontend-variables) for the
complete list.

```bash
BASE_URL=http://localhost:3000
NODE_ENV=development

# Generate secrets
CONFIRMATION_TOKEN_SECRET=$(openssl rand -base64 127)
RESET_PASSWORD_TOKEN_SECRET=$(openssl rand -base64 127)
SESSION_SECRET=$(openssl rand -base64 127)

# External services (you'll need to register for these)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_KEY=your-api-key
CLOUDINARY_SECRET=your-api-secret
NEXT_PUBLIC_MAPBOX_KEY=your-mapbox-token

# Database URL (current Prisma setup)
DATABASE_URL=your-postgres-connection-string
```

#### 3. Install Dependencies

```bash
npm install
```

#### 4. Run Prisma Migrations

```bash
npx prisma generate
npx prisma migrate dev
```

#### 5. Start Development Server

```bash
npm run dev
```

The frontend will be available at http://localhost:3000.

## Generate Diagrams (Optional)

The project includes PlantUML diagrams that can be converted to PDF or PNG:

### Install Java

Make sure Java 8+ is installed:

```bash
# Check Java version
java -version
```

### Generate Diagrams

```bash
# Generate all PDFs
make

# Generate PNGs
make pngs

# Generate both
make diagrams

# View help
make help
```

Generated diagrams will be in `docs/diagrams/pdf/`.

## Next Steps

- **Test the API**: Visit http://localhost:8080/swagger and try the endpoints
- **Run Tests**: See [Testing Guide](testing.md)
- **Learn the Architecture**: Read [Architecture Overview](architecture.md)
- **Understand Docker Setup**: See [Docker Guide](docker.md)
- **Database Details**: Check [Database Schema](database.md)

## Troubleshooting

### Port Already in Use

If port 8080 or 1433 is already in use, you can either:

- Stop the service using that port
- Change the port mapping in `docker-compose.dev.yaml`

### Database Connection Issues

Check that:

- SQL Server container is running: `docker ps`
- Connection string is correct in `.env.dev`
- Health check is passing: `docker compose -f docker-compose.dev.yaml ps`

### Container Won't Start

View container logs:

```bash
docker compose -f docker-compose.dev.yaml logs <service-name>
```

### Fresh Start

Remove all containers and volumes:

```bash
docker compose -f docker-compose.dev.yaml down -v
docker system prune -f
```

For more troubleshooting, see the [Docker Guide](docker.md#troubleshooting).
