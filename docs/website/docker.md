# Docker Guide

This document covers Docker deployment, configuration, and troubleshooting for
The Biergarten App.

## Overview

The project uses Docker Compose to orchestrate multiple services:

- SQL Server 2022 database
- Database migrations runner (DbUp)
- Database seeder
- .NET API
- Test runners

See the [deployment diagram](diagrams-out/deployment.svg) for visual
representation.

## Docker Compose Environments

### 1. Development (`docker-compose.dev.yaml`)

**Purpose**: Local development with persistent data

**Features**:

- Persistent SQL Server volume
- NuGet package cache volume (speeds up rebuilds)
- Swagger UI enabled
- Seed data included
- Local Mailpit SMTP server for dev email testing
- `CLEAR_DATABASE=true` (drops and recreates schema)

**Services**:

```yaml
sqlserver           # SQL Server 2022 (port 1433)
database.migrations # DbUp migrations
database.seed      # Seed initial data
api.core           # Web API (ports 8080, 8081)
mailpit            # Local dev SMTP server + UI (port 8025)
```

**Start Development Environment**:

```bash
docker compose --env-file web/.env.dev -f web/docker-compose.dev.yaml up -d
```

**Access**:

- API Swagger: http://localhost:8080/swagger
- Health Check: http://localhost:8080/health
- Mailpit UI: http://localhost:8025
- SQL Server: localhost:1433 (sa credentials from .env.dev)

**Stop Environment**:

```bash
# Stop services (keep volumes)
docker compose --env-file web/.env.dev -f web/docker-compose.dev.yaml down

# Stop and remove volumes (fresh start)
docker compose --env-file web/.env.dev -f web/docker-compose.dev.yaml down -v
```

### 2. Testing (`docker-compose.test.yaml`)

**Purpose**: Automated CI/CD testing in isolated environment

**Features**:

- Fresh database each run
- All test suites execute in parallel
- Test results exported to `./test-results/`
- Containers auto-exit after completion
- Fully isolated testnet network

**Services**:

```yaml
sqlserver           # Test database
database.migrations # Fresh schema
database.seed      # Test data
api.specs          # Reqnroll BDD tests
unit.tests         # All Features.*.Tests unit test projects
```

**Run Tests**:

```bash
# Run all tests
docker compose --env-file web/.env.test -f web/docker-compose.test.yaml up --abort-on-container-exit

# View results
ls -la test-results/
cat test-results/api-specs/results.trx
cat test-results/Features.Auth.Tests.trx

# Clean up
docker compose --env-file web/.env.test -f web/docker-compose.test.yaml down -v
```

### 3. Production (`docker-compose.prod.yaml`)

**Purpose**: Production-ready deployment

**Features**:

- Production logging levels
- No database clearing
- Optimized build configurations
- Health checks enabled
- Restart policies (unless-stopped)
- Security hardening

**Services**:

```yaml
sqlserver          # Production SQL Server
database.migrations # Schema updates only
api.core          # Production API
```

**Deploy Production**:

```bash
docker compose --env-file web/.env.prod -f web/docker-compose.prod.yaml up -d
```

## Service Dependencies

Docker Compose manages startup order using health checks:

```mermaid
sqlserver (health check)
    ↓
database.migrations (completes successfully)
    ↓
database.seed (completes successfully)
    ↓
api.core / tests (start when ready)
```

**Health Check Example** (SQL Server):

```yaml
healthcheck:
  test:
    [
      "CMD-SHELL",
      "sqlcmd -S localhost -U sa -P '${DB_PASSWORD}' -C -Q 'SELECT 1'",
    ]
  interval: 10s
  timeout: 5s
  retries: 12
  start_period: 30s
```

**Dependency Configuration**:

```yaml
api.core:
  depends_on:
    database.seed:
      condition: service_completed_successfully
```

## Volumes

### Persistent Volumes

**Development**:

- `sqlserverdata-dev` - Database files persist between restarts
- `nuget-cache-dev` - NuGet package cache (speeds up builds)

**Testing**:

- `sqlserverdata-test` - Temporary, typically removed after tests

**Production**:

- `sqlserverdata-prod` - Production database files
- `nuget-cache-prod` - Production NuGet cache

### Mounted Volumes

**Test Results**:

```yaml
volumes:
  - ./test-results:/app/test-results
```

Test results are written to host filesystem for CI/CD integration.

## Networks

Each environment uses isolated bridge networks:

- `devnet` - Development network
- `testnet` - Testing network (fully isolated)
- `prodnet` - Production network

## Environment Variables

All containers are configured via environment variables from `.env` files:

```yaml
env_file: ".env.dev" # or .env.test, .env.prod

environment:
  ASPNETCORE_ENVIRONMENT: "Development"
  DOTNET_RUNNING_IN_CONTAINER: "true"
  DB_SERVER: "${DB_SERVER}"
  DB_NAME: "${DB_NAME}"
  DB_USER: "${DB_USER}"
  DB_PASSWORD: "${DB_PASSWORD}"
  ACCESS_TOKEN_SECRET: "${ACCESS_TOKEN_SECRET}"
  REFRESH_TOKEN_SECRET: "${REFRESH_TOKEN_SECRET}"
  CONFIRMATION_TOKEN_SECRET: "${CONFIRMATION_TOKEN_SECRET}"
```

For complete list, see [Environment Variables](environment-variables.md).

## Common Commands

### View Services

```bash
# Running services
docker compose --env-file web/.env.dev -f web/docker-compose.dev.yaml ps

# All containers (including stopped)
docker ps -a
```

### View Logs

```bash
# All services
docker compose --env-file web/.env.dev -f web/docker-compose.dev.yaml logs -f

# Specific service
docker compose --env-file web/.env.dev -f web/docker-compose.dev.yaml logs -f api.core

# Last 100 lines
docker compose --env-file web/.env.dev -f web/docker-compose.dev.yaml logs --tail=100 api.core
```

### Execute Commands in Container

```bash
# Interactive shell
docker exec -it dev-env-api-core bash

# Run command
docker exec dev-env-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'password' -C
```

### Restart Services

```bash
# Restart all services
docker compose --env-file web/.env.dev -f web/docker-compose.dev.yaml restart

# Restart specific service
docker compose --env-file web/.env.dev -f web/docker-compose.dev.yaml restart api.core

# Rebuild and restart
docker compose --env-file web/.env.dev -f web/docker-compose.dev.yaml up -d --build api.core
```

### Build Images

```bash
# Build all images
docker compose --env-file web/.env.dev -f web/docker-compose.dev.yaml build

# Build specific service
docker compose --env-file web/.env.dev -f web/docker-compose.dev.yaml build api.core

# Build without cache
docker compose --env-file web/.env.dev -f web/docker-compose.dev.yaml build --no-cache
```

### Clean Up

```bash
# Stop and remove containers
docker compose --env-file web/.env.dev -f web/docker-compose.dev.yaml down

# Remove containers and volumes
docker compose --env-file web/.env.dev -f web/docker-compose.dev.yaml down -v

# Remove containers, volumes, and images
docker compose --env-file web/.env.dev -f web/docker-compose.dev.yaml down -v --rmi all

# System-wide cleanup
docker system prune -af --volumes
```

## Dockerfile Structure

### Multi-Stage Build

```dockerfile
# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["Project/Project.csproj", "Project/"]
RUN dotnet restore
COPY . .
RUN dotnet build -c Release

# Stage 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/build .
ENTRYPOINT ["dotnet", "Project.dll"]
```

## Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [.NET Docker Images](https://hub.docker.com/_/microsoft-dotnet)
- [SQL Server Docker Images](https://hub.docker.com/_/microsoft-mssql-server)
