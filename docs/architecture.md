# Architecture

This document describes the architecture patterns and design decisions for The Biergarten
App.

## High-Level Overview

The Biergarten App follows a **multi-project monorepo** architecture with clear separation
between backend and frontend:

- **Backend**: .NET 10 Web API with SQL Server
- **Frontend**: Next.js with TypeScript
- **Architecture Style**: Layered architecture with SQL-first approach

## Diagrams

For visual representations, see:

- [architecture.pdf](diagrams/pdf/architecture.pdf) - Layered architecture diagram
- [deployment.pdf](diagrams/pdf/deployment.pdf) - Docker deployment diagram
- [authentication-flow.pdf](diagrams/pdf/authentication-flow.pdf) - Authentication
  workflow
- [database-schema.pdf](diagrams/pdf/database-schema.pdf) - Database relationships

Generate diagrams with: `make diagrams`

## Backend Architecture

### Layered Architecture Pattern

The backend follows a strict layered architecture:

```
┌─────────────────────────────────────┐
│         API Layer (Controllers)     │
│   - HTTP Endpoints                  │
│   - Request/Response mapping        │
│   - Swagger/OpenAPI                 │
└─────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────┐
│      Service Layer (Business Logic) │
│   - Authentication logic            │
│   - User management                 │
│   - Validation & orchestration      │
└─────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────┐
│    Infrastructure Layer (Tools)     │
│   - JWT token generation            │
│   - Password hashing (Argon2id)     │
│   - Email services                  │
│   - Repository implementations      │
└─────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────┐
│      Domain Layer (Entities)        │
│   - UserAccount, UserCredential     │
│   - Pure POCO classes               │
│   - No external dependencies        │
└─────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────┐
│      Database (SQL Server)          │
│   - Stored procedures               │
│   - Tables & constraints            │
└─────────────────────────────────────┘
```

### Layer Responsibilities

#### API Layer (`API.Core`)

**Purpose**: HTTP interface and request handling

**Components**:

- Controllers (`AuthController`, `UserController`)
- Middleware for error handling
- Swagger/OpenAPI documentation
- Health check endpoints

**Dependencies**:

- Service layer
- ASP.NET Core framework

**Rules**:

- No business logic
- Only request/response transformation
- Delegates all work to Service layer

#### Service Layer (`Service.Auth`, `Service.UserManagement`)

**Purpose**: Business logic and orchestration

**Components**:

- Authentication services (login, registration)
- User management services
- Business rule validation
- Transaction coordination

**Dependencies**:

- Infrastructure layer (repositories, JWT, password hashing)
- Domain entities

**Rules**:

- Contains all business logic
- Coordinates multiple infrastructure components
- No direct database access (uses repositories)
- Returns domain models, not DTOs

#### Infrastructure Layer

**Purpose**: Technical capabilities and external integrations

**Components**:

- **Infrastructure.Repository**: Data access via stored procedures
- **Infrastructure.Jwt**: JWT token generation and validation
- **Infrastructure.PasswordHashing**: Argon2id password hashing
- **Infrastructure.Email**: Email sending capabilities
- **Infrastructure.Email.Templates**: Email template rendering

**Dependencies**:

- Domain entities
- External libraries (ADO.NET, JWT, Argon2, etc.)

**Rules**:

- Implements technical concerns
- No business logic
- Reusable across services

#### Domain Layer (`Domain.Entities`)

**Purpose**: Core business entities and models

**Components**:

- `UserAccount` - User profile data
- `UserCredential` - Authentication credentials
- `UserVerification` - Account verification state

**Dependencies**:

- None (pure domain)

**Rules**:

- Plain Old CLR Objects (POCOs)
- No framework dependencies
- No infrastructure references
- Represents business concepts

### Design Patterns

#### Repository Pattern

**Purpose**: Abstract database access behind interfaces

**Implementation**:

- `IAuthRepository` - Authentication queries
- `IUserAccountRepository` - User account queries
- `DefaultSqlConnectionFactory` - Connection management

**Benefits**:

- Testable (easy to mock)
- SQL-first approach (stored procedures)
- Centralized data access logic

**Example**:

```csharp
public interface IAuthRepository
{
    Task<UserCredential> GetUserCredentialAsync(string username);
    Task<int> CreateUserAccountAsync(UserAccount user, UserCredential credential);
}
```

#### Dependency Injection

**Purpose**: Loose coupling and testability

**Configuration**: `Program.cs` registers all services

**Lifetimes**:

- Scoped: Repositories, Services (per request)
- Singleton: Connection factories, JWT configuration
- Transient: Utilities, helpers

#### SQL-First Approach

**Purpose**: Leverage database capabilities

**Strategy**:

- All queries via stored procedures
- No ORM (Entity Framework not used)
- Database handles complex logic
- Application focuses on orchestration

**Stored Procedure Examples**:

- `USP_RegisterUser` - User registration
- `USP_GetUserAccountByUsername` - User lookup
- `USP_RotateUserCredential` - Password update

## Frontend Architecture

### Next.js Application Structure

```
Website/src/
├── components/        # React components
├── pages/            # Next.js routes
├── contexts/         # React context providers
├── hooks/            # Custom React hooks
├── controllers/      # Business logic layer
├── services/         # API communication
├── requests/         # API request builders
├── validation/       # Form validation schemas
├── config/           # Configuration & env vars
└── prisma/           # Database schema (current)
```

### Migration Strategy

The frontend is **transitioning** from a standalone architecture to integrate with the
.NET API:

**Current State**:

- Uses Prisma ORM with Postgres (Neon)
- Has its own server-side API routes
- Direct database access from Next.js

**Target State**:

- Pure client-side Next.js app
- All data via .NET API
- No server-side database access
- JWT-based authentication

## Security Architecture

### Authentication Flow

1. **Registration**:
   - User submits credentials
   - Password hashed with Argon2id
   - User account created
   - JWT token issued

2. **Login**:
   - User submits credentials
   - Password verified against hash
   - JWT token issued
   - Token stored client-side

3. **API Requests**:
   - Client sends JWT in Authorization header
   - Middleware validates token
   - Request proceeds if valid

### Password Security

**Algorithm**: Argon2id

- Memory: 64MB
- Iterations: 4
- Parallelism: CPU core count
- Salt: 128-bit (16 bytes)
- Hash: 256-bit (32 bytes)

### JWT Tokens

**Algorithm**: HS256 (HMAC-SHA256)

**Claims**:

- `sub` - User ID
- `unique_name` - Username
- `jti` - Unique token ID
- `iat` - Issued at timestamp
- `exp` - Expiration timestamp

**Configuration** (appsettings.json):

```json
{
  "Jwt": {
    "ExpirationMinutes": 60,
    "Issuer": "biergarten-api",
    "Audience": "biergarten-users"
  }
}
```

## Database Architecture

### SQL-First Philosophy

**Principles**:

1. Database is source of truth
2. Complex queries in stored procedures
3. Database handles referential integrity
4. Application orchestrates, database executes

**Benefits**:

- Performance optimization via execution plans
- Centralized query logic
- Version-controlled schema (migrations)
- Easier query profiling and tuning

### Migration Strategy

**Tool**: DbUp

**Process**:

1. Write SQL migration script
2. Embed in `Database.Migrations` project
3. Run migrations on startup
4. Idempotent and versioned

**Migration Files**:

```
scripts/
├── 001-CreateUserTables.sql
├── 002-CreateLocationTables.sql
├── 003-CreateBreweryTables.sql
└── ...
```

### Data Seeding

**Purpose**: Populate development/test databases

**Implementation**: `Database.Seed` project

**Seed Data**:

- Countries, states/provinces, cities
- Test user accounts
- Sample breweries (future)

## Deployment Architecture

### Docker Containerization

**Container Structure**:

- `sqlserver` - SQL Server 2022
- `database.migrations` - Schema migration runner
- `database.seed` - Data seeder
- `api.core` - ASP.NET Core Web API

**Environments**:

- Development (`docker-compose.dev.yaml`)
- Testing (`docker-compose.test.yaml`)
- Production (`docker-compose.prod.yaml`)

For details, see [Docker Guide](docker.md).

### Health Checks

**SQL Server**: Validates database connectivity **API**: Checks service health and
dependencies

**Configuration**:

```yaml
healthcheck:
  test: ['CMD-SHELL', 'sqlcmd health check']
  interval: 10s
  retries: 12
  start_period: 30s
```

## Testing Architecture

### Test Pyramid

```
    ┌──────────────┐
    │  Integration │  ← API.Specs (Reqnroll)
    │    Tests     │
    ├──────────────┤
    │  Unit Tests  │  ← Service.Auth.Tests
    │   (Service)  │     Repository.Tests
    ├──────────────┤
    │  Unit Tests  │
    │ (Repository) │
    └──────────────┘
```

**Strategy**:

- Many unit tests (fast, isolated)
- Fewer integration tests (slower, e2e)
- Mock external dependencies
- Test database for integration tests

For details, see [Testing Guide](testing.md).
