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
- [Environment Variables](#environment-variables)
  - [Overview](#overview)
  - [Backend Variables (.NET API)](#backend-variables-net-api)
  - [Frontend Variables (Next.js)](#frontend-variables-nextjs)
  - [Docker Variables](#docker-variables)
  - [External Services](#external-services)
  - [Generating Secrets](#generating-secrets)
  - [Environment File Structure](#environment-file-structure)
  - [Variable Reference Table](#variable-reference-table)
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

   Copy the example file and customize:
   ```bash
   cp .env.example .env.dev
   ```

   Required variables in `.env.dev`:
   ```bash
   # Database (component-based for Docker)
   DB_SERVER=sqlserver,1433
   DB_NAME=Biergarten
   DB_USER=sa
   DB_PASSWORD=YourStrong!Passw0rd

   # JWT Authentication
   JWT_SECRET=your-secret-key-minimum-32-characters-required
   ```

   For a complete list of all backend and frontend environment variables, see the [Environment Variables](#environment-variables) section.

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

   The frontend requires additional environment variables. See [Frontend Variables](#frontend-variables-nextjs) section.

   ```bash
   cd Website

   # Create .env.local with frontend variables
   # (see Environment Variables section)

   npm install
   npm run dev
   ```

   For complete environment variable documentation, see the [Environment Variables](#environment-variables) section below.

### Manual Setup (Without Docker)

#### Backend Setup

1. **Start SQL Server locally** or use a hosted instance

2. **Set environment variables**

   See [Backend Variables](#backend-variables-net-api) for details.

   ```bash
   # macOS/Linux
   export DB_CONNECTION_STRING="Server=localhost,1433;Database=Biergarten;User Id=sa;Password=YourStrong!Passw0rd;TrustServerCertificate=True;"
   export JWT_SECRET="your-secret-key-minimum-32-characters-required"

   # Windows PowerShell
   $env:DB_CONNECTION_STRING="Server=localhost,1433;Database=Biergarten;User Id=sa;Password=YourStrong!Passw0rd;TrustServerCertificate=True;"
   $env:JWT_SECRET="your-secret-key-minimum-32-characters-required"
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

#### Frontend Setup

1. **Navigate to Website directory**
   ```bash
   cd Website
   ```

2. **Create environment file**

   Create `.env.local` with required frontend variables. See [Frontend Variables](#frontend-variables-nextjs) for the complete list.

   ```bash
   # Example minimal setup
   BASE_URL=http://localhost:3000
   NODE_ENV=development

   # Generate secrets
   CONFIRMATION_TOKEN_SECRET=$(openssl rand -base64 127)
   RESET_PASSWORD_TOKEN_SECRET=$(openssl rand -base64 127)
   SESSION_SECRET=$(openssl rand -base64 127)

   # Add external service credentials
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_KEY=your-api-key
   CLOUDINARY_SECRET=your-api-secret
   # ... (see Environment Variables section for complete list)
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Run Prisma migrations** (current frontend database)
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

   The frontend will be available at http://localhost:3000

---

##  Environment Variables

### Overview

The Biergarten App uses environment variables for configuration across both backend (.NET API) and frontend (Next.js) services. This section provides complete documentation for all required and optional variables.

**Configuration Patterns:**
- **Backend**: Direct environment variable access via `Environment.GetEnvironmentVariable()`
- **Frontend**: Centralized configuration module at [src/Website/src/config/env/index.ts](src/Website/src/config/env/index.ts) with Zod validation
- **Docker**: Environment-specific `.env` files (`.env.dev`, `.env.test`, `.env.prod`)

### Backend Variables (.NET API)

The .NET API requires environment variables for database connectivity and JWT authentication. These can be set directly in your shell or via `.env` files when using Docker.

#### Database Connection

**Option 1: Component-Based (Recommended for Docker)**

Use individual components to build the connection string:

```bash
DB_SERVER=sqlserver,1433          # SQL Server address and port
DB_NAME=Biergarten                # Database name
DB_USER=sa                        # SQL Server username
DB_PASSWORD=YourStrong!Passw0rd   # SQL Server password
DB_TRUST_SERVER_CERTIFICATE=True  # Optional, defaults to True
```

**Option 2: Full Connection String (Local Development)**

Provide a complete SQL Server connection string:

```bash
DB_CONNECTION_STRING="Server=localhost,1433;Database=Biergarten;User Id=sa;Password=YourStrong!Passw0rd;TrustServerCertificate=True;"
```

The connection factory checks for `DB_CONNECTION_STRING` first, then falls back to building from components. See [DefaultSqlConnectionFactory.cs](src/Core/Repository/Repository.Core/Sql/DefaultSqlConnectionFactory.cs).

#### JWT Authentication

```bash
JWT_SECRET=your-secret-key-minimum-32-characters-required
```

- **Required**: Yes
- **Minimum Length**: 32 characters
- **Used For**: Signing JWT tokens for user authentication
- **Location**: [JwtService.cs](src/Core/Service/Service.Core/Services/JwtService.cs)

**Additional JWT Configuration** (in `appsettings.json`):
- `Jwt:ExpirationMinutes` - Token lifetime (default: 60)
- `Jwt:Issuer` - Token issuer (default: "biergarten-api")
- `Jwt:Audience` - Token audience (default: "biergarten-users")

#### Migration Control

```bash
CLEAR_DATABASE=true  # Development/Testing only
```

- **Required**: No
- **Effect**: If set to "true", drops and recreates the database during migrations
- **Usage**: Development and testing environments only
- **Warning**: Never use in production

### Frontend Variables (Next.js)

The Next.js frontend requires environment variables for external services, authentication, and database connectivity. Create a `.env` or `.env.local` file in the `Website/` directory.

All variables are validated at runtime using Zod schemas. See [src/Website/src/config/env/index.ts](src/Website/src/config/env/index.ts).

#### Base Configuration

```bash
BASE_URL=http://localhost:3000     # Application base URL
NODE_ENV=development               # Environment: development, production, test
```

#### Authentication & Sessions

```bash
# Token signing secrets (generate with: openssl rand -base64 127)
CONFIRMATION_TOKEN_SECRET=<generated-secret>     # Email confirmation tokens
RESET_PASSWORD_TOKEN_SECRET=<generated-secret>   # Password reset tokens
SESSION_SECRET=<generated-secret>                # Session cookie signing

# Session configuration
SESSION_TOKEN_NAME=biergarten      # Cookie name
SESSION_MAX_AGE=604800             # Cookie max age in seconds (604800 = 1 week)
```

#### Database (Prisma/Postgres)

**Current State**: The frontend currently uses Neon Postgres with Prisma. This will migrate to the SQL Server backend once feature parity is achieved.

```bash
POSTGRES_PRISMA_URL=postgresql://user:pass@host/db?pgbouncer=true   # Pooled connection
POSTGRES_URL_NON_POOLING=postgresql://user:pass@host/db             # Direct connection (migrations)
SHADOW_DATABASE_URL=postgresql://user:pass@host/shadow_db           # Prisma shadow DB
```

#### Admin Account

```bash
ADMIN_PASSWORD=SecureAdminPassword123!   # Initial admin account password for seeding
```

### Docker Variables

When running services in Docker, additional environment variables control container behavior:

#### ASP.NET Core

```bash
ASPNETCORE_ENVIRONMENT=Development              # Development, Production
ASPNETCORE_URLS=http://0.0.0.0:8080           # Binding address
DOTNET_RUNNING_IN_CONTAINER=true               # Container execution flag
```

#### SQL Server (Docker Container)

```bash
SA_PASSWORD=YourStrong!Passw0rd   # SQL Server SA password (maps to DB_PASSWORD)
ACCEPT_EULA=Y                     # Accept SQL Server EULA
MSSQL_PID=Express                 # SQL Server edition (Express, Developer, etc.)
```

**Note**: `SA_PASSWORD` in the SQL Server container maps to `DB_PASSWORD` for the API application.

### External Services

The frontend integrates with several third-party services. Sign up for accounts and retrieve API credentials:

#### Cloudinary (Image Hosting)

```bash
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name   # Public, client-accessible
CLOUDINARY_KEY=your-api-key                          # Server-side API key
CLOUDINARY_SECRET=your-api-secret                    # Server-side secret
```

**Setup**:
1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Navigate to Dashboard
3. Copy Cloud Name, API Key, and API Secret

**Note**: The `NEXT_PUBLIC_` prefix makes the cloud name accessible in client-side code.

#### Mapbox (Maps & Geocoding)

```bash
MAPBOX_ACCESS_TOKEN=pk.your-public-token
```

**Setup**:
1. Create account at [mapbox.com](https://mapbox.com)
2. Navigate to Account → Tokens
3. Create a new token with public scopes
4. Copy the access token

#### SparkPost (Email Service)

```bash
SPARKPOST_API_KEY=your-api-key
SPARKPOST_SENDER_ADDRESS=noreply@yourdomain.com
```

**Setup**:
1. Sign up at [sparkpost.com](https://sparkpost.com)
2. Verify your sending domain or use sandbox
3. Create an API key with "Send via SMTP" permission
4. Configure sender address (must match verified domain)

### Generating Secrets

For authentication secrets (`JWT_SECRET`, `CONFIRMATION_TOKEN_SECRET`, etc.), generate cryptographically secure random values:

**macOS/Linux:**
```bash
openssl rand -base64 127
```

**Windows PowerShell:**
```powershell
[Convert]::ToBase64String((1..127 | ForEach-Object { Get-Random -Maximum 256 }))
```

**Requirements**:
- `JWT_SECRET`: Minimum 32 characters
- Session/token secrets: Recommend 127+ characters for maximum security

### Environment File Structure

The project uses multiple environment files depending on the context:

#### Backend/Docker (Root Directory)

- **`.env.example`** - Template file (tracked in Git)
- **`.env.dev`** - Development environment (gitignored)
- **`.env.test`** - Testing environment (gitignored)
- **`.env.prod`** - Production environment (gitignored)

**Setup**:
```bash
# Copy template and customize
cp .env.example .env.dev
# Edit .env.dev with your values
```

Docker Compose files reference these:
- `docker-compose.dev.yaml` → `.env.dev`
- `docker-compose.test.yaml` → `.env.test`
- `docker-compose.prod.yaml` → `.env.prod`

#### Frontend (Website Directory)

- **`.env`** or **`.env.local`** - Local development (gitignored)

**Setup**:
```bash
cd Website
# Create .env file with frontend variables
touch .env.local
```

### Variable Reference Table

| Variable | Backend | Frontend | Docker | Required | Notes |
|----------|---------|----------|--------|----------|-------|
| **Database** |
| `DB_SERVER` | ✓ | | ✓ | Yes* | SQL Server address |
| `DB_NAME` | ✓ | | ✓ | Yes* | Database name |
| `DB_USER` | ✓ | | ✓ | Yes* | SQL username |
| `DB_PASSWORD` | ✓ | | ✓ | Yes* | SQL password |
| `DB_CONNECTION_STRING` | ✓ | | | Yes* | Alternative to components |
| `DB_TRUST_SERVER_CERTIFICATE` | ✓ | | ✓ | No | Defaults to True |
| `SA_PASSWORD` | | | ✓ | Yes | SQL Server container only |
| **Authentication (Backend)** |
| `JWT_SECRET` | ✓ | | ✓ | Yes | Min 32 chars |
| **Authentication (Frontend)** |
| `CONFIRMATION_TOKEN_SECRET` | | ✓ | | Yes | Email confirmation |
| `RESET_PASSWORD_TOKEN_SECRET` | | ✓ | | Yes | Password reset |
| `SESSION_SECRET` | | ✓ | | Yes | Session signing |
| `SESSION_TOKEN_NAME` | | ✓ | | No | Default: "biergarten" |
| `SESSION_MAX_AGE` | | ✓ | | No | Default: 604800 |
| **Base Configuration** |
| `BASE_URL` | | ✓ | | Yes | App base URL |
| `NODE_ENV` | | ✓ | | Yes | development/production |
| `ASPNETCORE_ENVIRONMENT` | ✓ | | ✓ | Yes | Development/Production |
| `ASPNETCORE_URLS` | ✓ | | ✓ | Yes | Binding address |
| **Database (Frontend - Current)** |
| `POSTGRES_PRISMA_URL` | | ✓ | | Yes | Pooled connection |
| `POSTGRES_URL_NON_POOLING` | | ✓ | | Yes | Direct connection |
| `SHADOW_DATABASE_URL` | | ✓ | | No | Prisma shadow DB |
| **External Services** |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | | ✓ | | Yes | Public, client-side |
| `CLOUDINARY_KEY` | | ✓ | | Yes | Server-side |
| `CLOUDINARY_SECRET` | | ✓ | | Yes | Server-side |
| `MAPBOX_ACCESS_TOKEN` | | ✓ | | Yes | Maps/geocoding |
| `SPARKPOST_API_KEY` | | ✓ | | Yes | Email service |
| `SPARKPOST_SENDER_ADDRESS` | | ✓ | | Yes | From address |
| **Other** |
| `ADMIN_PASSWORD` | | ✓ | | No | Seeding only |
| `CLEAR_DATABASE` | ✓ | | ✓ | No | Dev/test only |
| `ACCEPT_EULA` | | | ✓ | Yes | SQL Server EULA |
| `MSSQL_PID` | | | ✓ | No | SQL Server edition |

\* Either `DB_CONNECTION_STRING` OR the four component variables (`DB_SERVER`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`) are required.

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


