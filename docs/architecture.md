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

The legacy Next.js frontend has been retained in `archive/next-js-web-app/` for
reference only.

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
`Features.UserManagement`, `Features.Emails`, `Features.Locations`) is a single
project that owns its own MediatR commands/queries/handlers, validators, and
repository end to end. `Features.Emails` and `Features.Locations` have no
`Controllers/` folder — both are invoked internally by other slices via
MediatR/DI, never over HTTP:

```
┌───────────────────────────────────────────────────────────────────────┐
│                          API.Core (thin host)                         │
│   - Program.cs wiring: MediatR + AddApplicationPart per slice         │
│   - Swagger/OpenAPI, JWT auth middleware, global exception filter     │
└───────────────────────────────────────────────────────────────────────┘
                  ↓ discovers controllers via AddApplicationPart
┌───────────────┬───────────────┬───────────────────┬──────────────────┬──────────────────┐
│ Features.Auth │Features.      │ Features.          │ Features.Emails  │ Features.        │
│               │Breweries      │ UserManagement      │ (no controller,  │ Locations        │
│ Controller    │ Controller    │ Controller          │  internal only)  │ (no controller,  │
│ Commands/     │ Commands/     │ Commands/           │ Commands/        │  internal only)  │
│  Queries +    │  Queries +    │  Queries +          │  Handlers        │ Repository       │
│  Handlers     │  Handlers     │  Handlers           │                  │                  │
│ Repository    │ Repository    │ Repository          │ EmailDispatcher  │                  │
└───────────────┴───────────────┴───────────────────┴──────────────────┴──────────────────┘
       ↓ each slice depends only on shared/domain/infra, never on another slice
┌─────────────────────────┬─────────────────────────┬────────────────────┐
│ Shared.Contracts        │ Shared.Application        │ Domain.Entities /  │
│ (ResponseBody envelope) │ (ValidationBehavior,       │ Domain.Exceptions  │
│                         │  cross-slice email cmds)   │                    │
└─────────────────────────┴─────────────────────────┴────────────────────┘
       ↓
┌─────────────────────────────────────────────────────────────────────────┐
│ Database.Connection, Infrastructure.Jwt, Infrastructure.PasswordHashing,│
│ Infrastructure.Email, Infrastructure.Email.Templates                    │
└─────────────────────────────────────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────┐
│      Database (SQL Server)          │
│   - Tables & constraints            │
└─────────────────────────────────────┘
```

Slices never reference each other's project. The one cross-slice interaction
(`Features.Auth` triggering a confirmation email handled by `Features.Emails`)
goes through a MediatR command (`SendRegistrationEmailCommand`) whose contract
lives in `Shared.Application`, so neither slice takes a project reference on the
other.

### Layer responsibilities

#### API layer (`API.Core`)

**Purpose**: Thin ASP.NET Core host: no business logic, no controllers of its
own

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

#### Feature slices (`Features.Auth`, `Features.Breweries`, `Features.UserManagement`, `Features.Emails`, `Features.Locations`)

**Purpose**: Each slice is the complete vertical for one business capability

**Components** (per slice):

- `Controllers/`: HTTP endpoints, binding directly to Command/Query types as the
  request contract
- `Commands/<Operation>/` and `Queries/<Operation>/`: one folder per operation,
  each containing the Command/Query record, its `IRequestHandler`, and (for
  commands) a FluentValidation validator
- `Repository/`: the slice's own Dapper repository implementation
- `Dtos/`: response shapes returned by query handlers (never the raw domain
  entity)
- `DependencyInjection/`: an `AddFeaturesX()` extension method registering the
  slice's repository/services

`Features.Emails` has no `Controllers/` folder. It's invoked only via MediatR
commands sent from other slices, never over HTTP. `Features.Locations` also has
no `Controllers/` folder and no MediatR handlers — it exposes
`ILocationRepository` directly as a plain service, currently consumed only by
`Database.Seed` to look up cities while seeding brewery locations. Other slices
(for example, `Features.Breweries`) do not yet depend on it; they run their own
`CityID` existence checks inline.

**Dependencies**:

- `Domain.Entities`, `Domain.Exceptions`
- `Infrastructure.Sql` (generic ADO.NET plumbing) plus whichever infrastructure
  project the slice needs (`Infrastructure.Jwt`/
  `Infrastructure.PasswordHashing` for Auth, `Infrastructure.Email`/
  `Infrastructure.Email.Templates` for Emails)
- `Shared.Contracts`, `Shared.Application`
- **Never** another `Features.*` project

**Rules**:

- All business logic for that feature lives in its command/query handlers
- No direct controller-to-repository calls; everything flows through MediatR
- Read endpoints return a dedicated `Dto`, never the domain entity directly

#### Shared projects (`Shared.Contracts`, `Shared.Application`)

**Purpose**: The minimum cross-slice surface area required because every slice
needs it, or because duplicating it four times would be worse than sharing it

**Components**:

- `Shared.Contracts`: `ResponseBody<T>`/`ResponseBody`, the API response
  envelope every controller returns
- `Shared.Application`: `ValidationBehavior<TRequest,TResponse>` (the MediatR
  pipeline behavior that runs FluentValidation before a handler executes) and
  the cross-slice email commands (`SendRegistrationEmailCommand`,
  `SendResendConfirmationEmailCommand`)

**Rules**:

- Kept deliberately small: this is the exception to "no slice depends on another
  slice," not a general-purpose dumping ground

#### Infrastructure layer

**Purpose**: Technical capabilities and external integrations, shared by
whichever slices need them

**Components**:

- **Database.Connection**: generic ADO.NET connection/command plumbing
  (`DefaultSqlConnectionFactory`, the abstract `DapperRepository` base class), not
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
- `BreweryPost` - A user-submitted brewery listing
- `BreweryPostLocation` - A brewery's address and coordinates
- `City` - A city referenced by a brewery location
- `StateProvince` - A state/province referenced by a city
- `Country` - A country referenced by a state/province
- `BeerStyle` - A beer style/category (schema table exists; no repository yet)
- `BeerPost` - A beer listing tied to a brewery and style (schema table
  exists; no repository yet)

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
everything needed to understand or change one capability lives in one project

**Implementation**:

- Each HTTP write operation is a `Command` (for example, `CreateBreweryCommand`
  in `Features.Breweries/Commands/CreateBrewery/`); each read operation is a
  `Query` (for example, `GetBreweryByIdQuery`)
- Controllers bind directly to the Command/Query as the request body; there is
  no separate request DTO + mapping step for writes
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

**Implementation**: each slice owns its own repository, scoped to that feature
only:

- `Features.Auth/Repository/IAuthRepository.cs`
- `Features.Breweries/Repository/IBreweryRepository.cs`
- `Features.UserManagement/Repository/IUserAccountRepository.cs`
- `Database.Connection/DefaultSqlConnectionFactory.cs`: the generic connection
  factory every slice's repository builds on

**Benefits**:

- Testable (easy to mock)
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

**Configuration**: `Program.cs` wires up MediatR/FluentValidation across every
`Features.*` assembly; each slice exposes its own `AddFeaturesX()` extension
method that registers its repository and slice-internal services

**Lifetimes**:

- Scoped: Repositories, slice-internal services (per request)
- Singleton: `DefaultSqlConnectionFactory`
- Transient: Utilities, helpers

#### Direct SQL via Dapper/ADO.NET

**Purpose**: Keep data access explicit and colocated with the slice that owns
it, without an ORM's change-tracking or mapping magic

**Strategy**:

- No ORM (Entity Framework not used); each repository issues inline SQL
  through Dapper, with no manual `IDbCommand` parameter binding. The one
  wrinkle is the `GEOGRAPHY` column on `BreweryPostLocation`, which Dapper
  can't deserialize as a UDT: reads select `CONVERT(varbinary(max),
  Coordinates)` so the value comes back as a plain `byte[]` Dapper can bind
- Referential checks that a stored procedure used to perform (e.g. "does this
  `CityId` exist?") are now explicit `SELECT 1 ...` existence checks in the
  repository method, run inside the same transaction as the write
- Optimistic concurrency uses each table's `RowVersion` (`ROWVERSION`) column,
  checked in the `UPDATE ... WHERE ... AND RowVersion = @RowVersion` clause
- Repositories throw `Domain.Exceptions` types (`NotFoundException`,
  `ConflictException`, ...) directly when a check fails, rather than relying on
  a database-side `THROW`; `API.Core`'s `GlobalExceptionFilter` maps those
  exception types to HTTP status codes
- Application focuses on orchestration; the database enforces integrity via
  keys, `CHECK` constraints, and cascades

See [Database](website/database.md) for the schema and the app's current SQL
error-handling approach in more detail.

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
for reference only. Active product and engineering documentation should point to
`web/frontend`.

## Security architecture

### Authentication flow

1. **Registration**:
   - User submits credentials
   - Password hashed with Argon2id
   - User account created (unverified) and a confirmation email is dispatched
     via `Features.Emails`

2. **Email confirmation**:
   - User follows the confirmation link/token from the email
   - `Features.Auth`'s `ConfirmUser` command marks the account verified

3. **Login**:
   - User submits credentials
   - Password verified against hash
   - Access and refresh JWTs are issued; the refresh token is stored server-side
     against the user's credential row

4. **Token refresh**:
   - Client exchanges a valid, unexpired refresh token for a new access/refresh
     pair via `Features.Auth`'s `RefreshToken` command
   - Refresh tokens are stateless JWTs, not tracked server-side: the previous
     refresh token is not invalidated and remains usable until its own
     expiration

5. **API Requests**:
   - Client sends the access JWT in the `Authorization` header
   - `JwtAuthenticationHandler` validates the token
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

For the table-by-table schema and the custom SQL error code scheme, see
[Database](website/database.md).

### SQL-first philosophy

**Principles**:

1. Database is source of truth
2. Queries live in the owning repository, not scattered across the app
3. Database handles referential integrity
4. Application orchestrates, database executes

**Benefits**:

- Performance optimization via execution plans
- Query logic scoped to the repository that owns it, not spread across layers
- Version-controlled schema (migrations)
- Easier query profiling and tuning

### Migration strategy

**Tool**: DbUp

**Process**:

1. Write a SQL script under `Database.Migrations/scripts/`
2. Embed it in the `Database.Migrations` project
3. `Database.Migrations` runs each script against the target database on
   startup, tracked so a script never re-runs once applied

**Migration Files**:

```
scripts/
└── 01-schema/
    ├── 01-UserAccount.sql
    ├── 02-Photo.sql
    ├── ...
    └── 16-BeerPostComment.sql   # one script per CREATE TABLE
```

Each table has its own script, numbered so a table's foreign keys always point
at an earlier-numbered script. As the schema evolves, new numbered scripts get
added rather than editing an existing one in place, so DbUp's already-applied
tracking stays valid.

### Data seeding

**Purpose**: Populate development/test databases with realistic data

**Implementation**: `Database.Seed` project, using data produced by the C++
pipeline under `tooling/pipeline/` (see [Pipeline README](pipeline/README.md))

**Seed Data**:

- Countries, state/provinces, and cities (via `Features.Locations`'
  `ILocationRepository`, which creates `Country`/`StateProvince` rows on
  demand while resolving a city)
- User accounts (via `Features.Auth`'s repository)
- Brewery posts with locations (via `Features.Breweries`' repository)

Tables that exist in the schema but have no repository yet (`Photo`,
`UserAvatar`, `UserFollow`, `BeerStyle`, `BeerPost`, `BeerPostPhoto`,
`BeerPostComment`, `BreweryPostPhoto`) are not seeded.

## Deployment architecture

### Docker containerization

**Container Structure**:

- `sqlserver` - SQL Server 2022
- `database.migrations` - Schema migration runner
- `database.seed` - Data seeder
- `api.core` - ASP.NET Core Web API
- `mailpit` - Local dev/test SMTP server + web UI (not used in production)

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
    │   handler    │     (commands/queries/handlers, with repository/service
    │   tests)     │     dependencies mocked via Moq)
    └──────────────┘
```

**Strategy**:

- Many unit tests (fast, isolated)
- Fewer integration tests (slower, e2e)
- Mock external dependencies
- Test database for integration tests

For details, see [Testing Guide](website/testing.md).
