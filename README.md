# The Biergarten App

A social platform for craft beer enthusiasts to discover breweries, share reviews, and
connect with fellow beer lovers.

**Documentation**

- [Getting Started](docs/getting-started.md) - Setup and installation
- [Architecture](docs/architecture.md) - System design and patterns
- [Database](docs/database.md) - Schema and stored procedures
- [Docker Guide](docs/docker.md) - Container deployment
- [Testing](docs/testing.md) - Test strategy and commands
- [Environment Variables](docs/environment-variables.md) - Configuration reference

**Diagrams**

- [Architecture](docs/diagrams/pdf/architecture.pdf) - Layered architecture
- [Deployment](docs/diagrams/pdf/deployment.pdf) - Docker topology
- [Authentication Flow](docs/diagrams/pdf/authentication-flow.pdf) - Auth sequence
- [Database Schema](docs/diagrams/pdf/database-schema.pdf) - Entity relationships

## Project Status

**Active Development** - Transitioning from full-stack Next.js to multi-project monorepo

- Core authentication and user management APIs
- Database schema with migrations and seeding
- Layered architecture (Domain, Service, Infrastructure, Repository, API)
- Comprehensive test suite (unit + integration)
- Frontend integration with .NET API (in progress)
- Migration from Next.js serverless functions

---

## Tech Stack

**Backend**: .NET 10, ASP.NET Core, SQL Server 2022, DbUp **Frontend**: Next.js 14+,
TypeScript, TailwindCSS **Testing**: xUnit, Reqnroll (BDD), FluentAssertions, Moq
**Infrastructure**: Docker, Docker Compose **Security**: Argon2id password hashing, JWT
(HS256)

---

## Quick Start

### Prerequisites

- [.NET SDK 10+](https://dotnet.microsoft.com/download)
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [Node.js 18+](https://nodejs.org/) (for frontend)

### Start Development Environment

```bash
# Clone repository
git clone https://github.com/aaronpo97/the-biergarten-app
cd the-biergarten-app

# Configure environment
cp .env.example .env.dev

# Start all services
docker compose -f docker-compose.dev.yaml up -d

# View logs
docker compose -f docker-compose.dev.yaml logs -f
```

**Access**:

- API: http://localhost:8080/swagger
- Health: http://localhost:8080/health

### Run Tests

```bash
docker compose -f docker-compose.test.yaml up --abort-on-container-exit
```

Results are in `./test-results/`

---

## Repository Structure

```
src/Core/                          # Backend (.NET)
├── API/
│   ├── API.Core/                 # ASP.NET Core Web API
│   └── API.Specs/                # Integration tests (Reqnroll)
├── Database/
│   ├── Database.Migrations/      # DbUp migrations
│   └── Database.Seed/            # Data seeding
├── Domain.Entities/              # Domain models
├── Infrastructure/               # Cross-cutting concerns
│   ├── Infrastructure.Jwt/
│   ├── Infrastructure.PasswordHashing/
│   ├── Infrastructure.Email/
│   ├── Infrastructure.Repository/
│   └── Infrastructure.Repository.Tests/
└── Service/                      # Business logic
    ├── Service.Auth/
    ├── Service.Auth.Tests/
    └── Service.UserManagement/

Website/                          # Frontend (Next.js)
docs/                             # Documentation
docs/diagrams/                    # PlantUML diagrams
```

---

## Key Features

### Implemented

- User registration and authentication
- JWT token-based auth
- Argon2id password hashing
- SQL Server with stored procedures
- Database migrations (DbUp)
- Docker containerization
- Comprehensive test suite
- Swagger/OpenAPI documentation
- Health checks

### Planned

- [ ] Brewery discovery and management
- [ ] Beer reviews and ratings
- [ ] Social following/followers
- [ ] Geospatial brewery search
- [ ] Image upload (Cloudinary)
- [ ] Email notifications
- [ ] OAuth integration

---

## Architecture Highlights

### Layered Architecture

```
API Layer (Controllers)
    │
Service Layer (Business Logic)
    │
Infrastructure Layer (Repositories, JWT, Email)
    │
Domain Layer (Entities)
    │
Database (SQL Server + Stored Procedures)
```

### SQL-First Approach

- All queries via stored procedures
- No ORM (no Entity Framework)
- Version-controlled schema

### Security

- **Password Hashing**: Argon2id (64MB memory, 4 iterations)
- **JWT Tokens**: HS256 with configurable expiration
- **Credential Rotation**: Built-in password change support

See [Architecture Guide](docs/architecture.md) for details.

---

## Testing

The project includes three test suites:

| Suite                  | Type        | Framework      | Purpose                |
| ---------------------- | ----------- | -------------- | ---------------------- |
| **API.Specs**          | Integration | Reqnroll (BDD) | End-to-end API testing |
| **Repository.Tests**   | Unit        | xUnit          | Data access layer      |
| **Service.Auth.Tests** | Unit        | xUnit + Moq    | Business logic         |

**Run All Tests**:

```bash
docker compose -f docker-compose.test.yaml up --abort-on-container-exit
```

**Run Individual Test Suite**:

```bash
cd src/Core
dotnet test API/API.Specs/API.Specs.csproj
dotnet test Infrastructure/Infrastructure.Repository.Tests/Infrastructure.Repository.Tests.csproj
dotnet test Service/Service.Auth.Tests/Service.Auth.Tests.csproj
```

See [Testing Guide](docs/testing.md) for more information.

---

## Docker Environments

The project uses three Docker Compose configurations:

| File                         | Purpose       | Features                                          |
| ---------------------------- | ------------- | ------------------------------------------------- |
| **docker-compose.dev.yaml**  | Development   | Persistent data, hot reload, Swagger UI           |
| **docker-compose.test.yaml** | CI/CD Testing | Isolated DB, auto-exit, test results export       |
| **docker-compose.prod.yaml** | Production    | Optimized builds, health checks, restart policies |

**Common Commands**:

```bash
# Development
docker compose -f docker-compose.dev.yaml up -d
docker compose -f docker-compose.dev.yaml logs -f api.core
docker compose -f docker-compose.dev.yaml down -v

# Testing
docker compose -f docker-compose.test.yaml up --abort-on-container-exit
docker compose -f docker-compose.test.yaml down -v

# Build
docker compose -f docker-compose.dev.yaml build
docker compose -f docker-compose.dev.yaml build --no-cache
```

See [Docker Guide](docs/docker.md) for troubleshooting and advanced usage.

---

## Configuration

### Required Environment Variables

**Backend** (`.env.dev`):

```bash
DB_SERVER=sqlserver,1433
DB_NAME=Biergarten
DB_USER=sa
DB_PASSWORD=YourStrong!Passw0rd
JWT_SECRET=<min-32-chars>
```

**Frontend** (`.env.local`):

```bash
BASE_URL=http://localhost:3000
NODE_ENV=development
CONFIRMATION_TOKEN_SECRET=<generated>
RESET_PASSWORD_TOKEN_SECRET=<generated>
SESSION_SECRET=<generated>
# + External services (Cloudinary, Mapbox, SparkPost)
```

See [Environment Variables Guide](docs/environment-variables.md) for complete reference.

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Workflow

1. Start development environment: `docker compose -f docker-compose.dev.yaml up -d`
2. Make changes to code
3. Run tests: `docker compose -f docker-compose.test.yaml up --abort-on-container-exit`
4. Rebuild if needed: `docker compose -f docker-compose.dev.yaml up -d --build api.core`

## Support

- **Documentation**: [docs/](docs/)
- **Architecture**: See [Architecture Guide](docs/architecture.md)
