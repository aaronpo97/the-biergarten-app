# The Biergarten App

A social platform for craft beer enthusiasts to discover breweries, share reviews, and connect with fellow beer lovers.


## Table of Contents

- [Project Status](#project-status)
- [Repository Structure](#repository-structure)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Quick Start (Development Environment)](#quick-start-development-environment)
  - [Manual Setup (Without Docker)](#manual-setup-without-docker)
- [Testing](#testing)
- [Database Schema](#database-schema)
- [Authentication & Security](#authentication--security)
- [Architecture Patterns](#architecture-patterns)
- [Docker & Containerization](#docker--containerization)
  - [Container Architecture](#container-architecture)
  - [Docker Compose Environments](#docker-compose-environments)
  - [Service Dependencies](#service-dependencies)
  - [Health Checks](#health-checks)
  - [Volumes](#volumes)
  - [Networks](#networks)
  - [Environment Variables](#environment-variables)
  - [Container Lifecycle](#container-lifecycle)
- [Docker Tips & Troubleshooting](#docker-tips--troubleshooting)
- [Roadmap](#roadmap)
- [License](#license)
- [Contact & Support](#contact--support)

---


##  Project Status

This project is in active development, transitioning from a full-stack Next.js application to a **multi-project monorepo** with:
- **Backend**: .NET 10 Web API with SQL Server
- **Frontend**: Next.js with TypeScript
- **Architecture**: SQL-first approach using stored procedures

**Current State** (February 2025):
-  Core authentication and user management APIs functional
-  Database schema and migrations established
-  Repository and service layers implemented
-  Frontend integration with .NET API in progress
-  Migrating remaining features from Next.js serverless functions

**The Next.js app currently runs standalone with its original Prisma/Neon Postgres backend. It will be fully integrated with the .NET API once feature parity is achieved.**

---

##  Repository Structure

```
src/Core/
├── API/
│   ├── API.Core/          # ASP.NET Core Web API with Swagger/OpenAPI
│   └── API.Specs/         # Integration tests using Reqnroll (BDD)
├── Database/
│   ├── Database.Migrations/  # DbUp migrations (embedded SQL scripts)
│   └── Database.Seed/        # Database seeding for development/testing
├── Repository/
│   ├── Repository.Core/   # Data access layer (stored procedure-based)
│   └── Repository.Tests/  # Unit tests for repositories
└── Service/
    └── Service.Core/      # Business logic layer

Website/                   # Next.js frontend application
```

### Key Components

**API Layer** (`API.Core`)
- RESTful endpoints for authentication, users, and breweries
- Controllers: `AuthController`, `UserController`
- Configured with Swagger UI for API exploration
- Health checks and structured logging

**Database Layer**
- SQL Server with stored procedures for all data operations
- DbUp for version-controlled migrations
- Comprehensive schema including users, breweries, beers, locations, and social features
- Seeders for development data (users, locations across US/Canada/Mexico)

**Repository Layer** (`Repository.Core`)
- Abstraction over SQL Server using ADO.NET
- `ISqlConnectionFactory` for connection management
- Repositories: `UserAccountRepository`, `UserCredentialRepository`
- All data access via stored procedures (no inline SQL)

**Service Layer** (`Service.Core`)
- Business logic and orchestration
- Services: `AuthService`, `UserService`, `JwtService`
- Password hashing with Argon2id
- JWT token generation

**Frontend** (`Website`)
- Next.js 14+ with TypeScript
- TailwindCSS, Headless UI, DaisyUI for UI components
- Integrations: Mapbox (maps), Cloudinary (image hosting)
- Progressive migration from serverless API routes to .NET API

---

##  Technology Stack

### Backend
- **.NET 10** - Latest C# and runtime features
- **ASP.NET Core** - Web API framework
- **SQL Server 2022** - Primary database
- **DbUp** - Database migration tool
- **Argon2id** - Password hashing
- **JWT** - Authentication tokens

### Frontend
- **Next.js 14+** - React framework
- **TypeScript** - Type safety
- **TailwindCSS** - Utility-first CSS
- **Mapbox GL** - Interactive maps
- **Cloudinary** - Image management

### Testing
- **xUnit** - Unit testing framework
- **Reqnroll** - BDD/Gherkin integration testing
- **FluentAssertions** - Assertion library
- **DbMocker** - Database mocking

### DevOps & Infrastructure
- **Docker** - Containerization for all services
- **Docker Compose** - Multi-container orchestration
- **Multi-stage builds** - Optimized image sizes
- **Health checks** - Container readiness and liveness probes
- **Separate environments** - Development, testing, and production configurations

---

##  Getting Started

### Prerequisites

- **.NET SDK 10+** ([Download](https://dotnet.microsoft.com/download))
- **Node.js 18+** ([Download](https://nodejs.org/))
- **Docker Desktop** ([Download](https://www.docker.com/products/docker-desktop))

### Quick Start (Development Environment)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd biergarten-app
   ```

2. **Configure environment variables**

   Create a `.env` file in the project root:
   ```bash
   # Database
   SA_PASSWORD=YourStrong!Passw0rd
   DB_CONNECTION_STRING=Server=localhost,1433;Database=Biergarten;User Id=sa;Password=YourStrong!Passw0rd;TrustServerCertificate=True;
   MASTER_DB_CONNECTION_STRING=Server=localhost,1433;Database=master;User Id=sa;Password=YourStrong!Passw0rd;TrustServerCertificate=True;

   # JWT Authentication
   JWT_SECRET=your-secret-key-here-min-32-chars
   ```

3. **Start the development environment**
   ```bash
   docker compose -f docker-compose.dev.yaml up -d
   ```

   This will:
   - Start SQL Server
   - Run database migrations
   - Seed initial data
   - Start the API on http://localhost:8080

4. **Access Swagger UI**

   Navigate to http://localhost:8080/swagger to explore and test API endpoints.

5. **Run the frontend** (optional)
   ```bash
   cd Website
   npm install
   npm run dev
   ```

   For Website environment variables, see `Website/README.old.md`.

### Manual Setup (Without Docker)

1. **Start SQL Server locally** or use a hosted instance

2. **Set environment variable**
   ```bash
   # macOS/Linux
   export DB_CONNECTION_STRING="Server=localhost,1433;Database=Biergarten;User Id=sa;Password=YourStrong!Passw0rd;TrustServerCertificate=True;"
   export JWT_SECRET="your-secret-key-here-min-32-chars"

   # Windows PowerShell
   $env:DB_CONNECTION_STRING="Server=localhost,1433;Database=Biergarten;User Id=sa;Password=YourStrong!Passw0rd;TrustServerCertificate=True;"
   $env:JWT_SECRET="your-secret-key-here-min-32-chars"
   ```

3. **Run migrations**
   ```bash
   cd src/Core
   dotnet run --project Database/Database.Migrations/Database.Migrations.csproj
   ```

4. **Seed the database**
   ```bash
   dotnet run --project Database/Database.Seed/Database.Seed.csproj
   ```

5. **Start the API**
   ```bash
   dotnet run --project API/API.Core/API.Core.csproj
   ```

---

##  Testing

### Run All Tests (Docker)
```bash
docker compose -f docker-compose.test.yaml up --abort-on-container-exit
```

This runs:
- **API.Specs** - BDD integration tests
- **Repository.Tests** - Unit tests for data access

Test results are output to `./test-results/`.

### Run Tests Locally

**Integration Tests (API.Specs)**
```bash
cd src/Core
dotnet test API/API.Specs/API.Specs.csproj
```

**Unit Tests (Repository.Tests)**
```bash
cd src/Core
dotnet test Repository/Repository.Tests/Repository.Tests.csproj
```

### Test Features

Current test coverage includes:
- User authentication (login, registration)
- JWT token generation
- Password validation
- 404 error handling
- User repository operations

---

##  Database Schema

The database uses a SQL-first approach with comprehensive normalization and referential integrity.

### Key Tables

**User Management**
- `UserAccount` - User profiles
- `UserCredential` - Password hashes (Argon2id)
- `UserVerification` - Account verification status
- `UserAvatar` - Profile pictures
- `UserFollow` - Social following relationships

**Location Data**
- `Country` - ISO 3166-1 country codes
- `StateProvince` - ISO 3166-2 subdivisions
- `City` - City/municipality data

**Content**
- `BreweryPost` - Brewery information
- `BreweryPostLocation` - Geographic data with `GEOGRAPHY` type
- `BeerStyle` - Beer style taxonomy
- `BeerPost` - Individual beers with ABV/IBU
- `BeerPostComment` - User reviews and ratings
- `Photo` - Image metadata

**Stored Procedures** (examples)
- `USP_RegisterUser` - Create user account with credential
- `USP_GetUserAccountByUsername` - Retrieve user by username
- `USP_RotateUserCredential` - Update password
- `USP_CreateCountry/StateProvince/City` - Location management

---

##  Authentication & Security

- **Password Hashing**: Argon2id with configurable parameters
  - Salt: 128-bit (16 bytes)
  - Hash: 256-bit (32 bytes)
  - Memory: 64MB
  - Iterations: 4
  - Parallelism: Based on CPU cores

- **JWT Tokens**: HS256 signing
  - Claims: User ID (sub), Username (unique_name), JTI
  - Configurable expiration (60-120 minutes)
  - Secret key from environment variable

- **Credential Management**:
  - Credential rotation/invalidation supported
  - Expiry tracking (90-day default)
  - Revocation timestamps

---

##  Architecture Patterns

### Layered Architecture
```
API (Controllers)
    |
Service Layer (Business Logic)
    |
Repository Layer (Data Access)
    |
Database (SQL Server)
```

### Design Patterns
- **Repository Pattern**: Abstraction over data access
- **Dependency Injection**: Constructor injection throughout
- **Factory Pattern**: `ISqlConnectionFactory` for database connections
- **Service Pattern**: Encapsulated business logic

### SQL-First Approach
- All CRUD operations via stored procedures
- No ORM (Entity Framework, Dapper, etc.)
- Direct ADO.NET for maximum control
- Version-controlled schema via DbUp

---

##  Docker & Containerization


### Container Architecture

### Docker Compose Environments

Three separate compose files manage different environments:

#### 1. **Development** (`docker-compose.dev.yaml`)
- **Purpose**: Local development with live data
- **Features**:
  - SQL Server with persistent volume
  - Database migrations with `CLEAR_DATABASE=true` (drops/recreates schema)
  - Seed data for testing
  - API accessible on `localhost:8080`
  - Hot reload support via volume mounts

**Services**:
```yaml
sqlserver          # SQL Server 2022 (port 1433)
database.migrations # Runs DbUp migrations
database.seed      # Seeds initial data
api.core          # Web API (ports 8080, 8081)
```

**Usage**:
```bash
docker compose -f docker-compose.dev.yaml up -d
docker compose -f docker-compose.dev.yaml logs -f  # View logs
docker compose -f docker-compose.dev.yaml down     # Stop all services
```

#### 2. **Testing** (`docker-compose.test.yaml`)
- **Purpose**: Automated CI/CD testing
- **Features**:
  - Isolated test database
  - Runs integration and unit tests
  - Test results exported to `./test-results/`
  - Containers exit after tests complete

**Services**:
```yaml
sqlserver          # Test database instance
database.migrations # Fresh schema each run
database.seed      # Test data
api.specs          # Integration tests (Reqnroll)
repository.tests   # Unit tests (xUnit)
```

**Usage**:
```bash
docker compose -f docker-compose.test.yaml up --abort-on-container-exit;
docker compose -f docker-compose.test.yaml down -v;
# View results in ./test-results/
```

#### 3. **Production** (`docker-compose.prod.yaml`)
- **Purpose**: Production-like deployment
- **Features**:
  - Production logging levels
  - No database clearing
  - Optimized builds
  - Health checks enabled
  - Restart policies configured

**Services**:
```yaml
sqlserver          # Production SQL Server
database.migrations # Schema updates only (no drops)
api.core          # Production API
```

### Service Dependencies

Docker Compose manages service startup order using **health checks** and **depends_on** conditions:

```yaml
database.migrations:
  depends_on:
    sqlserver:
      condition: service_healthy  # Waits for SQL Server to be ready

database.seed:
  depends_on:
    database.migrations:
      condition: service_completed_successfully  # Waits for migrations
```

**Flow**:
1. `sqlserver` starts and runs health check (SQL query)
2. `database.migrations` starts when SQL Server is healthy
3. `database.seed` starts when migrations complete successfully
4. `api.core` starts when seeding completes

### Health Checks

SQL Server container includes a health check to ensure it's ready:

```yaml
healthcheck:
  test: ["CMD-SHELL", "/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P '${SA_PASSWORD}' -C -Q 'SELECT 1' || exit 1"]
  interval: 10s
  timeout: 5s
  retries: 12
  start_period: 30s
```

This prevents downstream services from attempting connections before SQL Server is ready.

### Volumes

**Persistent Storage**:
- `sqlserverdata-dev` - Development database data
- `sqlserverdata-test` - Test database data
- `sqlserverdata-prod` - Production database data
- `nuget-cache-dev/prod` - NuGet package cache (speeds up builds)

**Mounted Volumes**:
```yaml
volumes:
  - ./test-results:/app/test-results  # Export test results to host
  - nuget-cache-dev:/root/.nuget/packages  # Cache dependencies
```

### Networks

Each environment uses isolated bridge networks:
- `devnet` - Development network
- `testnet` - Testing network (fully isolated)
- `prodnet` - Production network

This prevents cross-environment communication and enhances security.

### Environment Variables

All containers receive configuration via environment variables:

```yaml
environment:
  ASPNETCORE_ENVIRONMENT: "Development"
  DOTNET_RUNNING_IN_CONTAINER: "true"
  DB_CONNECTION_STRING: "${DB_CONNECTION_STRING}"
  JWT_SECRET: "${JWT_SECRET}"
```

Values are populated from the `.env` file in the project root.

### Container Lifecycle

**Development Workflow**:
```bash
# Start environment
docker compose -f docker-compose.dev.yaml up -d

# View logs
docker compose -f docker-compose.dev.yaml logs -f api.core

# Restart a service
docker compose -f docker-compose.dev.yaml restart api.core

# Rebuild after code changes
docker compose -f docker-compose.dev.yaml up -d --build api.core

# Clean shutdown
docker compose -f docker-compose.dev.yaml down

# Remove volumes (fresh start)
docker compose -f docker-compose.dev.yaml down -v
```

**Testing Workflow**:
```bash
# Run tests (containers auto-exit)
docker compose -f docker-compose.test.yaml up --abort-on-container-exit

# Check test results
cat test-results/test-results.trx
cat test-results/repository-tests.trx

# Clean up
docker compose -f docker-compose.test.yaml down -v
```

##  Docker Tips & Troubleshooting

### Common Commands

**View running containers**:
```bash
docker ps
```

**View all containers (including stopped)**:
```bash
docker ps -a
```

**View logs for a specific service**:
```bash
docker compose -f docker-compose.dev.yaml logs -f api.core
```

**Execute commands in a running container**:
```bash
docker exec -it dev-env-api-core bash
```

**Connect to SQL Server from host**:
```bash
# Using sqlcmd (if installed)
sqlcmd -S localhost,1433 -U sa -P 'YourStrong!Passw0rd' -C

# Config
Server: localhost,1433
Authentication: SQL Login
Username: sa
Password: (from .env)
```

---

##  Roadmap

### Near-term
- [ ] Complete API endpoints for breweries and beers
- [ ] Integrate frontend with .NET API
- [ ] Implement image upload service
- [ ] Add comprehensive API documentation

### Medium-term
- [ ] Geospatial queries for nearby breweries
- [ ] Advanced authentication (OAuth, 2FA)
---

##  License

See [LICENSE.md](LICENSE.md) for details.

---

##  Contact & Support

For questions about this project, please open an issue in the repository.


