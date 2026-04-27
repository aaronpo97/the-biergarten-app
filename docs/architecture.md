# Architecture

This document describes the active architecture of The Biergarten App.

## High-Level Overview

The Biergarten App is a monorepo with a clear split between the backend and the
active website:

- **Backend**: .NET 10 Web API with SQL Server and a layered architecture
- **Frontend**: React 19 + React Router 7 website in `src/Website`
- **Architecture Style**: Layered backend plus server-rendered React frontend

The legacy Next.js frontend has been retained in `src/Website-v1` for reference
only and is documented in
[archive/legacy-website-v1.md](archive/legacy-website-v1.md).

## Diagrams

For visual representations, see:

- [architecture.svg](diagrams-out/architecture.svg) - Layered architecture
  diagram
- [deployment.svg](diagrams-out/deployment.svg) - Docker deployment diagram
- [authentication-flow.svg](diagrams-out/authentication-flow.svg) -
  Authentication workflow
- [database-schema.svg](diagrams-out/database-schema.svg) - Database
  relationships

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

### Active Website (`src/Website`)

The current website is a React Router 7 application with server-side rendering
enabled.

```text
src/Website/
├── app/
│   ├── components/      Shared UI such as Navbar, FormField, SubmitButton, ToastProvider
│   ├── lib/             Auth helpers, schemas, and theme metadata
│   ├── routes/          Route modules for home, login, register, dashboard, confirm, theme
│   ├── root.tsx         App shell and global providers
│   └── app.css          Theme tokens and global styling
├── .storybook/          Storybook config and preview setup
├── stories/             Storybook stories for shared UI and themes
├── tests/playwright/    Storybook Playwright coverage
└── package.json         Frontend scripts and dependencies
```

### Frontend Responsibilities

- Render the auth demo and theme guide routes
- Manage cookie-backed website session state
- Call the .NET API for login, registration, token refresh, and confirmation
- Provide shared UI building blocks for forms, navigation, themes, and toasts
- Supply Storybook documentation and browser-based component verification

### Theme System

The active website uses semantic DaisyUI theme tokens backed by four Biergarten
themes:

- Biergarten Lager
- Biergarten Stout
- Biergarten Cassis
- Biergarten Weizen

All component styling should prefer semantic tokens such as `primary`,
`success`, `surface`, and `highlight` instead of hard-coded color values.

### Legacy Frontend

The previous Next.js frontend has been archived at `src/Website-v1`. Active
product and engineering documentation should point to `src/Website`, while
legacy notes live in
[archive/legacy-website-v1.md](archive/legacy-website-v1.md).

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

**SQL Server**: Validates database connectivity **API**: Checks service health
and dependencies

**Configuration**:

```yaml
healthcheck:
  test: ["CMD-SHELL", "sqlcmd health check"]
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
