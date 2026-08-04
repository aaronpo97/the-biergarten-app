# Architecture

This document describes the active architecture of The Biergarten App.

## High-level overview

The Biergarten App is a monorepo with a clear split between the backend and the
active website:

- **Backend**: .NET 10 Web API with SQL Server, organized as vertical feature
  slices with MediatR
- **Frontend**: React 19 + React Router 7 website in `web/frontend`
- **Architecture Style**: Vertical-slice backend plus server-rendered React
  frontend

The legacy Next.js frontend has been retained in `archive/next-js-web-app/`
for reference only.

## Diagrams

For visual representations, see:

- [architecture.svg](website/diagrams-out/architecture.svg) - Vertical-slice
  architecture diagram
- [deployment.svg](website/diagrams-out/deployment.svg) - Docker deployment
  diagram
- [authentication-flow.svg](website/diagrams-out/authentication-flow.svg) -
  Authentication workflow
- [database-schema.svg](website/diagrams-out/database-schema.svg) - Database
  relationships

## Backend architecture

### Vertical-slice architecture pattern

The backend organizes business capabilities as feature slices instead of
technical layers. Each feature (`Features.Auth`, `Features.Breweries`,
`Features.UserManagement`, `Features.Emails`) is a single project that owns
its own controller, MediatR commands/queries/handlers, validators, and
repository, end to end:

```
┌───────────────────────────────────────────────────────────────────────┐
│                          API.Core (thin host)                         │
│   - Program.cs wiring: MediatR + AddApplicationPart per slice         │
│   - Swagger/OpenAPI, JWT auth middleware, global exception filter     │
└───────────────────────────────────────────────────────────────────────┘
                  ↓ discovers controllers via AddApplicationPart
┌───────────────┬───────────────┬───────────────────┬───────────────────┐
│ Features.Auth │Features.      │ Features.          │ Features.Emails  │
│               │Breweries      │ UserManagement      │ (no controller,  │
│ Controller    │ Controller    │ Controller          │  internal only)  │
│ Commands/     │ Commands/     │ Commands/           │ Commands/        │
│  Queries +    │  Queries +    │  Queries +          │  Handlers        │
│  Handlers     │  Handlers     │  Handlers           │                  │
│ Repository    │ Repository    │ Repository          │ EmailDispatcher  │
└───────────────┴───────────────┴───────────────────┴───────────────────┘
       ↓ each slice depends only on shared/domain/infra, never on another slice
┌─────────────────────────┬─────────────────────────┬────────────────────┐
│ Shared.Contracts        │ Shared.Application        │ Domain.Entities /  │
│ (ResponseBody envelope) │ (ValidationBehavior,       │ Domain.Exceptions  │
│                         │  cross-slice email cmds)   │                    │
└─────────────────────────┴─────────────────────────┴────────────────────┘
       ↓
┌─────────────────────────────────────────────────────────────────────────┐
│ Infrastructure.Sql, Infrastructure.Jwt, Infrastructure.PasswordHashing,  │
│ Infrastructure.Email, Infrastructure.Email.Templates                    │
└─────────────────────────────────────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────┐
│      Database (SQL Server)          │
│   - Stored procedures               │
│   - Tables & constraints            │
└─────────────────────────────────────┘
```

Slices never reference each other's project. The one cross-slice
interaction (`Features.Auth` triggering a confirmation email handled by
`Features.Emails`) goes through a MediatR command (`SendRegistrationEmailCommand`)
whose contract lives in `Shared.Application`, so neither slice takes a
project reference on the other.

### Layer responsibilities

#### API layer (`API.Core`)

**Purpose**: Thin ASP.NET Core host: no business logic, no controllers of
its own

**Components**:

- `Program.cs`: registers MediatR (scanning every `Features.*` assembly),
  FluentValidation, and uses `AddApplicationPart` so each slice's controllers
  are discovered by MVC
- `GlobalException.cs`: global exception filter (host-level cross-cutting
  concern)
- `Authentication/JwtAuthenticationHandler.cs`: JWT auth scheme middleware
- Swagger/OpenAPI documentation, health check endpoints

**Dependencies**:

- Every `Features.*` project (for controller/MediatR discovery)
- `Shared.Contracts`, `Shared.Application`
- `Infrastructure.Jwt` (for the auth middleware)

**Rules**:

- No controllers, no business logic, no feature-specific contracts
- Exists purely to host and wire up the feature slices

#### Feature slices (`Features.Auth`, `Features.Breweries`, `Features.UserManagement`, `Features.Emails`)

**Purpose**: Each slice is the complete vertical for one business capability

**Components** (per slice):

- `Controllers/`: HTTP endpoints, binding directly to Command/Query types
  as the request contract
- `Commands/<Operation>/` and `Queries/<Operation>/`: one folder per
  operation, each containing the Command/Query record, its
  `IRequestHandler`, and (for commands) a FluentValidation validator
- `Repository/`: the slice's own stored-procedure repository
  implementation
- `Dtos/`: response shapes returned by query handlers (never the raw
  domain entity)
- `DependencyInjection/`: an `AddFeaturesX()` extension method registering
  the slice's repository/services

`Features.Emails` has no `Controllers/` folder. It's invoked only via
MediatR commands sent from other slices, never over HTTP.

**Dependencies**:

- `Domain.Entities`, `Domain.Exceptions`
- `Infrastructure.Sql` (generic ADO.NET plumbing) plus whichever
  infrastructure project the slice needs (`Infrastructure.Jwt`/
  `Infrastructure.PasswordHashing` for Auth, `Infrastructure.Email`/
  `Infrastructure.Email.Templates` for Emails)
- `Shared.Contracts`, `Shared.Application`
- **Never** another `Features.*` project

**Rules**:

- All business logic for that feature lives in its command/query handlers
- No direct controller-to-repository calls; everything flows through
  MediatR
- Read endpoints return a dedicated `Dto`, never the domain entity directly

#### Shared projects (`Shared.Contracts`, `Shared.Application`)

**Purpose**: The minimum cross-slice surface area required because every
slice needs it, or because duplicating it four times would be worse than
sharing it

**Components**:

- `Shared.Contracts`: `ResponseBody<T>`/`ResponseBody`, the API response
  envelope every controller returns
- `Shared.Application`: `ValidationBehavior<TRequest,TResponse>` (the
  MediatR pipeline behavior that runs FluentValidation before a handler
  executes) and the cross-slice email commands
  (`SendRegistrationEmailCommand`, `SendResendConfirmationEmailCommand`)

**Rules**:

- Kept deliberately small: this is the exception to "no slice depends on
  another slice," not a general-purpose dumping ground

#### Infrastructure layer

**Purpose**: Technical capabilities and external integrations, shared by
whichever slices need them

**Components**:

- **Infrastructure.Sql**: generic ADO.NET connection/command plumbing
  (`ISqlConnectionFactory`, the abstract `Repository<T>` base class), not
  domain-specific; each slice's own `Repository/` folder builds on this
- **Infrastructure.Jwt**: JWT token generation and validation
- **Infrastructure.PasswordHashing**: Argon2id password hashing
- **Infrastructure.Email**: Email sending capabilities (SMTP/MailKit)
- **Infrastructure.Email.Templates**: Email template rendering (Razor
  components)

**Dependencies**:

- Domain entities
- External libraries (ADO.NET, JWT, Argon2, MailKit, and so on)

**Rules**:

- Implements technical concerns only, no business logic
- Reusable across slices

#### Domain layer (`Domain.Entities`)

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

### Design patterns

#### Vertical slice + MediatR

**Purpose**: Organize code by feature instead of by technical layer, so
everything needed to understand or change one capability lives in one
project

**Implementation**:

- Each HTTP write operation is a `Command` (for example, `CreateBreweryCommand`
  in `Features.Breweries/Commands/CreateBrewery/`); each read operation is a
  `Query` (for example, `GetBreweryByIdQuery`)
- Controllers bind directly to the Command/Query as the request body;
  there is no separate request DTO + mapping step for writes
- A single shared `ValidationBehavior<TRequest,TResponse>`
  (`Shared.Application/Behaviors/`) runs FluentValidation validators in the
  MediatR pipeline before any handler executes
- Query handlers map to a dedicated response `Dto`, so domain entities never
  leak over the wire

**Example**:

```csharp
public record CreateBreweryCommand(Guid PostedById, string BreweryName, string Description, ...)
    : IRequest<BreweryDto>;

public class CreateBreweryHandler(IBreweryRepository repository) : IRequestHandler<CreateBreweryCommand, BreweryDto>
{
    public async Task<BreweryDto> Handle(CreateBreweryCommand request, CancellationToken cancellationToken) { ... }
}
```

#### Repository pattern

**Purpose**: Abstract database access behind interfaces

**Implementation**: each slice owns its own repository, scoped to that
feature only:

- `Features.Auth/Repository/IAuthRepository.cs`
- `Features.Breweries/Repository/IBreweryRepository.cs`
- `Features.UserManagement/Repository/IUserAccountRepository.cs`
- `Infrastructure.Sql/DefaultSqlConnectionFactory.cs`: the generic
  connection factory every slice's repository builds on

**Benefits**:

- Testable (easy to mock)
- SQL-first approach (stored procedures)
- Each slice's data access logic is self-contained

**Example**:

```csharp
public interface IAuthRepository
{
    Task<UserCredential> GetUserCredentialAsync(string username);
    Task<int> CreateUserAccountAsync(UserAccount user, UserCredential credential);
}
```

#### Dependency injection

**Purpose**: Loose coupling and testability

**Configuration**: `Program.cs` wires up MediatR/FluentValidation across
every `Features.*` assembly; each slice exposes its own `AddFeaturesX()`
extension method that registers its repository and slice-internal services

**Lifetimes**:

- Scoped: Repositories, slice-internal services (per request)
- Singleton: `ISqlConnectionFactory`
- Transient: Utilities, helpers

#### SQL-first approach

**Purpose**: Push complex logic into the database

**Strategy**:

- All queries via stored procedures
- No ORM (Entity Framework not used)
- Database handles complex logic
- Application focuses on orchestration

**Stored Procedure Examples**:

- `USP_RegisterUser` - User registration
- `USP_GetUserAccountByUsername` - User lookup
- `USP_RotateUserCredential` - Password update

## Frontend architecture

### Active website (`web/frontend`)

The current website is a React Router 7 application with server-side rendering
enabled.

```text
web/frontend/
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

### Frontend responsibilities

- Render the auth demo and theme guide routes
- Manage cookie-backed website session state
- Call the .NET API for login, registration, token refresh, and confirmation
- Provide shared UI building blocks for forms, navigation, themes, and toasts
- Supply Storybook documentation and browser-based component verification

### Theme system

The active website uses semantic DaisyUI theme tokens backed by four Biergarten
themes:

- Biergarten Lager
- Biergarten Stout
- Biergarten Cassis
- Biergarten Weizen

All component styling should prefer semantic tokens such as `primary`,
`success`, `surface`, and `highlight` instead of hard-coded color values.

### Legacy frontend

The previous Next.js frontend has been archived at `archive/next-js-web-app/`
for reference only. Active product and engineering documentation should point
to `web/frontend`.

## Security architecture

### Authentication flow

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

### Password security

**Algorithm**: Argon2id

- Memory: 64MB
- Iterations: 4
- Parallelism: CPU core count
- Salt: 128-bit (16 bytes)
- Hash: 256-bit (32 bytes)

### JWT tokens

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

## Database architecture

### SQL-first philosophy

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

### Migration strategy

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

### Data seeding

**Purpose**: Populate development/test databases

**Implementation**: `Database.Seed` project

**Seed Data**:

- Countries, states/provinces, cities
- Test user accounts
- Sample breweries (future)

## Deployment architecture

### Docker containerization

**Container Structure**:

- `sqlserver` - SQL Server 2022
- `database.migrations` - Schema migration runner
- `database.seed` - Data seeder
- `api.core` - ASP.NET Core Web API

**Environments**:

- Development (`docker-compose.dev.yaml`)
- Testing (`docker-compose.test.yaml`)
- Production (`docker-compose.prod.yaml`)

For details, see [Docker Guide](website/docker.md).

### Health checks

- **SQL Server**: Validates database connectivity
- **API**: Checks service health and dependencies

**Configuration**:

```yaml
healthcheck:
  test: ["CMD-SHELL", "sqlcmd health check"]
  interval: 10s
  retries: 12
  start_period: 30s
```

## Testing architecture

### Test pyramid

```
    ┌──────────────┐
    │  Integration │  ← API.Specs (Reqnroll)
    │    Tests     │
    ├──────────────┤
    │  Unit Tests  │  ← Features.Auth.Tests, Features.Breweries.Tests,
    │ (per slice,  │     Features.UserManagement.Tests, Features.Emails.Tests
    │  handlers +  │     (commands/queries/handlers + that slice's own
    │  repository) │     repository, mocked with Moq/DbMocker)
    └──────────────┘
```

**Strategy**:

- Many unit tests (fast, isolated)
- Fewer integration tests (slower, e2e)
- Mock external dependencies
- Test database for integration tests

For details, see [Testing Guide](website/testing.md).
