# Environment variables

This document covers the active environment variables used by the current
Biergarten stack.

## Overview

The application uses environment variables for:

- **.NET API backend** - database connections, token secrets, runtime settings
- **React Router website** - API base URL and session signing
- **Docker containers** - environment-specific orchestration

## Configuration patterns

### Backend (.NET API)

Direct environment variable access via `Environment.GetEnvironmentVariable()`.

### Frontend (`web/frontend`)

The active website reads runtime values from the server environment for its auth
and API integration. In Docker, the `frontend` service is wired into the same
`web/.env.dev` / `.env.test` / `.env.prod` files as the backend; running it
locally with `npm run dev` still reads from the shell environment.

### Docker

Environment-specific `.env` files loaded via `env_file:` in docker-compose.yaml:

- `.env.dev` - Development
- `.env.test` - Testing
- `.env.prod` - Production

### Generating an env file

`web/generate-env.sh` copies `.env.example` to a target file and replaces the
secret-bearing values (`DB_PASSWORD`, `ACCESS_TOKEN_SECRET`,
`REFRESH_TOKEN_SECRET`, `CONFIRMATION_TOKEN_SECRET`, `SESSION_SECRET`,
`SMTP_USERNAME`, `SMTP_PASSWORD`, `SEAWEEDFS_ACCESS_KEY_ID`,
`SEAWEEDFS_SECRET_ACCESS_KEY`)
with freshly randomized ones via `openssl`. Non-secret values are left
untouched. The output file is written with `600` permissions.

```bash
cd web
./generate-env.sh .env.dev
```

Pass the output path, and optionally a template path, as arguments (default
output: `.env`, default template: `.env.example`). The script prompts before
overwriting an existing file. Randomized `SMTP_USERNAME`/`SMTP_PASSWORD` are dev
placeholders; replace them with real provider credentials for
staging/production.

## Backend variables (.NET API)

### Database connection

**Option 1: Component-Based (Recommended for Docker)**

Build connection string from individual components:

```bash
DB_SERVER=sqlserver,1433          # SQL Server host and port
DB_NAME=Biergarten                # Database name
DB_USER=sa                        # SQL Server username
DB_PASSWORD=YourStrong!Passw0rd   # SQL Server password
DB_TRUST_SERVER_CERTIFICATE=True  # Optional, defaults to True
```

**Option 2: Full Connection String (Local Development)**

Provide complete connection string:

```bash
DB_CONNECTION_STRING="Server=localhost,1433;Database=Biergarten;User Id=sa;Password=YourStrong!Passw0rd;TrustServerCertificate=True;"
```

**Priority**: `DB_CONNECTION_STRING` is checked first. If not found, connection
string is built from components.

**Implementation**: See `DefaultSqlConnectionFactory.cs`

### JSON Web Token (JWT) authentication secrets (backend)

The backend uses separate secrets for different token types to enable
independent key rotation and validation isolation.

```bash
# Access token secret (1-hour tokens)
ACCESS_TOKEN_SECRET=<generated-secret>              # Signs short-lived access tokens

# Refresh token secret (21-day tokens)
REFRESH_TOKEN_SECRET=<generated-secret>             # Signs long-lived refresh tokens

# Confirmation token secret (30-minute tokens)
CONFIRMATION_TOKEN_SECRET=<generated-secret>        # Signs email confirmation tokens

# Website base URL (used in confirmation emails)
WEBSITE_BASE_URL=https://thebiergarten.app          # Base URL for the website
```

**Security Requirements**:

- Use at least 32 characters per secret
- Use 127 or more characters in production
- Generate secrets with a cryptographically secure random function
- Never reuse secrets across token types or environments
- Rotate secrets periodically in production

**Generate Secrets**:

**macOS/Linux - Generate a cryptographically secure base64 secret (127 raw
bytes)**

```bash
openssl rand -base64 127
```

**Windows - PowerShell 5.1 compatible (cryptographically secure, 127 raw
bytes)**

```powershell
$bytes = New-Object byte[] 127
$rng = [System.Security.Cryptography.RNGCryptoServiceProvider]::new()
$rng.GetBytes($bytes)
[Convert]::ToBase64String($bytes)
$rng.Dispose()
```

**Windows - PowerShell 7+ compatible (cryptographically secure, 127 raw bytes)**

```powershell
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(127))
```

**Token Expiration**:

- **Access tokens**: 1 hour
- **Refresh tokens**: 21 days
- **Confirmation tokens**: 30 minutes

(Defined in `TokenServiceExpirationHours` class)

**JWT Implementation**:

- **Algorithm**: HS256 (HMAC-SHA256)
- **Handler**: Microsoft.IdentityModel.JsonWebTokens.JsonWebTokenHandler
- **Validation**: Token signature, expiration, and malformed token checks

### Migration control

```bash
CLEAR_DATABASE=true
```

- **Required**: No
- **Default**: `false`
- **Effect**: If set to `true`, drops and recreates the database during
  migrations
- **Usage**: Development and testing environments only
- **Warning**: Never use in production

### ASP.NET Core configuration

```bash
ASPNETCORE_ENVIRONMENT=Development    # Development, Production, Staging
ASPNETCORE_URLS=http://0.0.0.0:8080  # Binding address and port
DOTNET_RUNNING_IN_CONTAINER=true     # Flag for container execution
```

## Frontend variables (`web/frontend`)

The active website does not use the old Next.js/Prisma environment model. Its
core runtime variables are:

```bash
API_BASE_URL=http://api.core:8080        # Base URL for the .NET API (container DNS name in Docker)
SESSION_SECRET=<generated-secret>        # Cookie session signing secret
NODE_ENV=development                     # Standard Node runtime mode
PORT=3000                                # Port the built server listens on
```

The `frontend` Docker service hardcodes `API_BASE_URL` to `http://api.core:8080`
(the backend's in-network service name) and `PORT` to `3000`; only
`SESSION_SECRET` is sourced from the env file, and `NODE_ENV` is set per
compose file (`development` in dev, `production` in prod).

### Frontend variable details

#### `API_BASE_URL`

- **Required**: Yes for local development
- **Default in code**: `http://localhost:8080`
- **Used by**: `web/frontend/app/features/auth/auth.server.ts`,
  `web/frontend/app/features/breweries/breweries.server.ts`
- **Purpose**: Routes website auth and API calls to the .NET API

#### `SESSION_SECRET`

- **Required**: Strongly recommended in all environments
- **Default in local code path**: `dev-secret-change-me`
- **Used by**: React Router cookie session storage in `auth.server.ts`
- **Purpose**: Signs and validates the website session cookie

#### `NODE_ENV`

- **Required**: No
- **Typical values**: `development`, `production`, `test`
- **Purpose**: Controls secure cookie behavior and runtime mode

#### `PORT`

- **Required**: No
- **Default**: `3000`
- **Purpose**: Port the built server (`build/server/index.js`) binds to

### SMTP configuration (backend)

Read by `Infrastructure.Email/SmtpEmailProvider.cs` for sending confirmation and
account emails.

```bash
SMTP_HOST=mailpit                        # Required, no default
SMTP_PORT=1025                           # Optional, defaults to 587
SMTP_USERNAME=<username>                 # Optional, no default
SMTP_PASSWORD=<password>                 # Optional, no default
SMTP_USE_SSL=false                       # Optional, defaults to true
SMTP_FROM_EMAIL=noreply@thebiergarten.app # Required, no default
SMTP_FROM_NAME=The Biergarten App        # Optional, defaults to "The Biergarten"
```

- **Implementation**: `Infrastructure.Email/SmtpEmailProvider.cs` throws on
  startup if `SMTP_HOST` or `SMTP_FROM_EMAIL` is missing
- **Local dev**: point at the `mailpit` Docker service (SMTP on port 1025, web
  UI on http://localhost:8025)
- **Production**: point at a real provider (SendGrid, Mailgun, Amazon SES, and
  so on)

### File storage configuration (backend)

Read by `Infrastructure.FileUpload/S3FileStorageProvider.cs` for uploading and
retrieving photos via an S3-compatible object store.

```bash
SEAWEEDFS_SERVICE_URL=http://seaweedfs:8333   # Required, no default
SEAWEEDFS_ACCESS_KEY_ID=admin                 # Required, no default
SEAWEEDFS_SECRET_ACCESS_KEY=secret            # Required, no default
SEAWEEDFS_BUCKET=my-bucket                    # Required, no default
```

- **Implementation**: `S3FileStorageProvider` throws on construction if any of
  these four values is missing
- **Local dev**: point at the `seaweedfs` Docker service (S3 API on port 8333)
- **Production**: point at any S3-compatible endpoint (AWS S3, a hosted
  SeaweedFS cluster, and so on); `ForcePathStyle` is always enabled, which
  SeaweedFS requires and AWS S3 also accepts

## Docker-specific variables

### SQL Server container

```bash
SA_PASSWORD=YourStrong!Passw0rd   # SQL Server SA password
ACCEPT_EULA=Y                     # Accept SQL Server EULA (required)
MSSQL_PID=Express                 # SQL Server edition (Express, Developer, Enterprise)
```

**Password Requirements**:

- Minimum 8 characters
- Uppercase, lowercase, digits, and special characters
- Maps to `DB_PASSWORD` for application containers

## Environment file structure

### Backend/Docker (`web/` directory)

```
web/.env.example          # Template (tracked in Git)
web/.env.dev             # Development config (gitignored)
web/.env.test            # Testing config (gitignored)
web/.env.prod            # Production config (gitignored)
```

**Setup**:

```bash
cp web/.env.example web/.env.dev
# Edit web/.env.dev with your values
```

## Legacy frontend variables

Variables for the archived Next.js frontend (`archive/next-js-web-app/`) have
been removed from this active reference, since that app is retained for
reference only and is not run as part of the active stack.

**Docker Compose Mapping**:

- `web/docker-compose.dev.yaml` → `web/.env.dev`
- `web/docker-compose.test.yaml` → `web/.env.test`
- `web/docker-compose.prod.yaml` → `web/.env.prod`

## Variable reference table

| Variable                      | Backend | Frontend | Docker | Required | Notes                        |
| ----------------------------- | :-----: | :------: | :----: | :------: | ---------------------------- |
| `DB_SERVER`                   |    ✓    |          |   ✓    |  Yes\*   | SQL Server address           |
| `DB_NAME`                     |    ✓    |          |   ✓    |  Yes\*   | Database name                |
| `DB_USER`                     |    ✓    |          |   ✓    |  Yes\*   | SQL username                 |
| `DB_PASSWORD`                 |    ✓    |          |   ✓    |  Yes\*   | SQL password                 |
| `DB_CONNECTION_STRING`        |    ✓    |          |        |  Yes\*   | Alternative to components    |
| `DB_TRUST_SERVER_CERTIFICATE` |    ✓    |          |   ✓    |    No    | Defaults to `True`           |
| `ACCESS_TOKEN_SECRET`         |    ✓    |          |   ✓    |   Yes    | Access token signing         |
| `REFRESH_TOKEN_SECRET`        |    ✓    |          |   ✓    |   Yes    | Refresh token signing        |
| `CONFIRMATION_TOKEN_SECRET`   |    ✓    |          |   ✓    |   Yes    | Confirmation token signing   |
| `WEBSITE_BASE_URL`            |    ✓    |          |        |   Yes    | Website URL for emails       |
| `SMTP_HOST`                   |    ✓    |          |   ✓    |   Yes    | SMTP server host             |
| `SMTP_PORT`                   |    ✓    |          |   ✓    |    No    | Defaults to `587`            |
| `SMTP_USERNAME`               |    ✓    |          |   ✓    |    No    | SMTP auth username           |
| `SMTP_PASSWORD`               |    ✓    |          |   ✓    |    No    | SMTP auth password           |
| `SMTP_USE_SSL`                |    ✓    |          |   ✓    |    No    | Defaults to `true`           |
| `SMTP_FROM_EMAIL`             |    ✓    |          |   ✓    |   Yes    | Email sender address         |
| `SMTP_FROM_NAME`              |    ✓    |          |   ✓    |    No    | Defaults to `The Biergarten` |
| `SEAWEEDFS_SERVICE_URL`       |    ✓    |          |   ✓    |   Yes    | S3-compatible endpoint URL   |
| `SEAWEEDFS_ACCESS_KEY_ID`     |    ✓    |          |   ✓    |   Yes    | S3 access key                |
| `SEAWEEDFS_SECRET_ACCESS_KEY` |    ✓    |          |   ✓    |   Yes    | S3 secret key                |
| `SEAWEEDFS_BUCKET`            |    ✓    |          |   ✓    |   Yes    | S3 bucket name               |
| `API_BASE_URL`                |         |    ✓     |   ✓    |   Yes    | Website-to-API base URL      |
| `SESSION_SECRET`              |         |    ✓     |   ✓    |   Yes    | Website session signing      |
| `NODE_ENV`                    |         |    ✓     |   ✓    |    No    | Runtime mode                 |
| `PORT`                        |         |    ✓     |   ✓    |    No    | Frontend server port         |
| `CLEAR_DATABASE`              |    ✓    |          |   ✓    |    No    | Dev/test reset flag          |
| `ASPNETCORE_ENVIRONMENT`      |    ✓    |          |   ✓    |   Yes    | ASP.NET environment          |
| `ASPNETCORE_URLS`             |    ✓    |          |   ✓    |   Yes    | API binding address          |
| `SA_PASSWORD`                 |         |          |   ✓    |   Yes    | SQL Server container         |
| `ACCEPT_EULA`                 |         |          |   ✓    |   Yes    | SQL Server EULA              |
| `MSSQL_PID`                   |         |          |   ✓    |    No    | SQL Server edition           |
| `DOTNET_RUNNING_IN_CONTAINER` |    ✓    |          |   ✓    |    No    | Container flag               |

\* Either `DB_CONNECTION_STRING` OR the component variables (`DB_SERVER`,
`DB_NAME`, `DB_USER`, `DB_PASSWORD`) must be provided.

## Validation

### Backend validation

Variables are validated at startup:

- Missing required variables (`ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET`,
  `CONFIRMATION_TOKEN_SECRET`, `SMTP_HOST`, `SMTP_FROM_EMAIL`,
  `SEAWEEDFS_SERVICE_URL`, `SEAWEEDFS_ACCESS_KEY_ID`,
  `SEAWEEDFS_SECRET_ACCESS_KEY`, `SEAWEEDFS_BUCKET`, DB connection values)
  cause the application to fail with an `InvalidOperationException`
- No minimum length is enforced on the token secrets in code; the "minimum 32
  characters" guidance above is a recommendation, not an enforced check

### Frontend validation

The active website relies on runtime defaults for local development and the
surrounding server environment in deployed environments.

- `API_BASE_URL` defaults to `http://localhost:8080`
- `SESSION_SECRET` falls back to a development-only local secret
- `NODE_ENV` controls secure cookie behavior

## Example configuration files

### `.env.dev` (backend/Docker)

```bash
# Database
DB_SERVER=sqlserver,1433
DB_NAME=Biergarten
DB_USER=sa
DB_PASSWORD=Dev_Password_123!

# JWT Authentication Secrets
ACCESS_TOKEN_SECRET=<generated-with-openssl>
REFRESH_TOKEN_SECRET=<generated-with-openssl>
CONFIRMATION_TOKEN_SECRET=<generated-with-openssl>
WEBSITE_BASE_URL=http://localhost:3000

# Frontend session signing
SESSION_SECRET=<generated-with-openssl>

# SMTP (Mailpit in dev)
SMTP_HOST=mailpit
SMTP_PORT=1025
SMTP_USE_SSL=false
SMTP_FROM_EMAIL=noreply@thebiergarten.app
SMTP_FROM_NAME=The Biergarten App

# SeaweedFS (S3-compatible storage)
SEAWEEDFS_SERVICE_URL=http://seaweedfs:8333
SEAWEEDFS_ACCESS_KEY_ID=<generated-with-openssl>
SEAWEEDFS_SECRET_ACCESS_KEY=<generated-with-openssl>
SEAWEEDFS_BUCKET=my-bucket

# Migration
CLEAR_DATABASE=true

# ASP.NET Core
ASPNETCORE_ENVIRONMENT=Development
ASPNETCORE_URLS=http://0.0.0.0:8080

# SQL Server Container
SA_PASSWORD=Dev_Password_123!
ACCEPT_EULA=Y
MSSQL_PID=Express
```

### Frontend local runtime example

```bash
API_BASE_URL=http://localhost:8080
SESSION_SECRET=<generated-with-openssl>
NODE_ENV=development
```
