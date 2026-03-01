# Environment Variables

Complete documentation for all environment variables used in The Biergarten App.

## Overview

The application uses environment variables for configuration across:

- **.NET API Backend** - Database connections, JWT secrets
- **Next.js Frontend** - External services, authentication
- **Docker Containers** - Runtime configuration

## Configuration Patterns

### Backend (.NET API)

Direct environment variable access via `Environment.GetEnvironmentVariable()`.

### Frontend (Next.js)

Centralized configuration module at `src/Website/src/config/env/index.ts` with Zod
validation.

### Docker

Environment-specific `.env` files loaded via `env_file:` in docker-compose.yaml:

- `.env.dev` - Development
- `.env.test` - Testing
- `.env.prod` - Production

## Backend Variables (.NET API)

### Database Connection

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

**Priority**: `DB_CONNECTION_STRING` is checked first. If not found, connection string is
built from components.

**Implementation**: See `DefaultSqlConnectionFactory.cs`

### JWT Authentication Secrets (Backend)

The backend uses separate secrets for different token types to enable independent key rotation and validation isolation.

```bash
# Access token secret (1-hour tokens)
ACCESS_TOKEN_SECRET=<generated-secret>              # Signs short-lived access tokens

# Refresh token secret (21-day tokens)
REFRESH_TOKEN_SECRET=<generated-secret>             # Signs long-lived refresh tokens

# Confirmation token secret (30-minute tokens)
CONFIRMATION_TOKEN_SECRET=<generated-secret>        # Signs email confirmation tokens
```

**Security Requirements**:

- Each secret should be minimum 32 characters
- Recommend 127+ characters for production
- Generate using cryptographically secure random functions
- Never reuse secrets across token types or environments
- Rotate secrets periodically in production

**Generate Secrets**:

```bash
# macOS/Linux - Generate 127-character base64 secret
openssl rand -base64 127

# Windows PowerShell
[Convert]::ToBase64String((1..127 | %{Get-Random -Max 256}))
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

### Migration Control

```bash
CLEAR_DATABASE=true
```

- **Required**: No
- **Default**: false
- **Effect**: If "true", drops and recreates database during migrations
- **Usage**: Development and testing environments ONLY
- **Warning**: NEVER use in production

### ASP.NET Core Configuration

```bash
ASPNETCORE_ENVIRONMENT=Development    # Development, Production, Staging
ASPNETCORE_URLS=http://0.0.0.0:8080  # Binding address and port
DOTNET_RUNNING_IN_CONTAINER=true     # Flag for container execution
```

## Frontend Variables (Next.js)

Create `.env.local` in the `Website/` directory.

### Base Configuration

```bash
BASE_URL=http://localhost:3000     # Application base URL
NODE_ENV=development               # Environment: development, production, test
```

### Authentication & Sessions

```bash
# Token signing secrets (use openssl rand -base64 127)
CONFIRMATION_TOKEN_SECRET=<generated-secret>      # Email confirmation tokens
RESET_PASSWORD_TOKEN_SECRET=<generated-secret>    # Password reset tokens
SESSION_SECRET=<generated-secret>                 # Session cookie signing

# Session configuration
SESSION_TOKEN_NAME=biergarten      # Cookie name (optional)
SESSION_MAX_AGE=604800             # Cookie max age in seconds (optional, default: 1 week)
```

**Security Requirements**:

- All secrets should be 127+ characters
- Generate using cryptographically secure random functions
- Never reuse secrets across environments
- Rotate secrets periodically in production

### Database (Current - Prisma/Postgres)

**Note**: Frontend currently uses Neon Postgres. Will migrate to .NET API.

```bash
POSTGRES_PRISMA_URL=postgresql://user:pass@host/db?pgbouncer=true   # Pooled connection
POSTGRES_URL_NON_POOLING=postgresql://user:pass@host/db             # Direct connection (migrations)
SHADOW_DATABASE_URL=postgresql://user:pass@host/shadow_db           # Prisma shadow DB (optional)
```

### External Services

#### Cloudinary (Image Hosting)

```bash
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name   # Public, client-accessible
CLOUDINARY_KEY=your-api-key                          # Server-side API key
CLOUDINARY_SECRET=your-api-secret                    # Server-side secret
```

**Setup Steps**:

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Navigate to Dashboard
3. Copy Cloud Name, API Key, and API Secret

**Note**: `NEXT_PUBLIC_` prefix makes variable accessible in client-side code.

#### Mapbox (Maps & Geocoding)

```bash
MAPBOX_ACCESS_TOKEN=pk.your-public-token
```

**Setup Steps**:

1. Create account at [mapbox.com](https://mapbox.com)
2. Navigate to Account → Tokens
3. Create new token with public scopes
4. Copy access token

#### SparkPost (Email Service)

```bash
SPARKPOST_API_KEY=your-api-key
SPARKPOST_SENDER_ADDRESS=noreply@yourdomain.com
```

**Setup Steps**:

1. Sign up at [sparkpost.com](https://sparkpost.com)
2. Verify sending domain or use sandbox
3. Create API key with "Send via SMTP" permission
4. Configure sender address (must match verified domain)

### Admin Account (Seeding)

```bash
ADMIN_PASSWORD=SecureAdminPassword123!   # Initial admin password for seeding
```

- **Required**: No (only needed for seeding)
- **Purpose**: Sets admin account password during database seeding
- **Security**: Use strong password, change immediately in production

## Docker-Specific Variables

### SQL Server Container

```bash
SA_PASSWORD=YourStrong!Passw0rd   # SQL Server SA password
ACCEPT_EULA=Y                     # Accept SQL Server EULA (required)
MSSQL_PID=Express                 # SQL Server edition (Express, Developer, Enterprise)
```

**Password Requirements**:

- Minimum 8 characters
- Uppercase, lowercase, digits, and special characters
- Maps to `DB_PASSWORD` for application containers

## Environment File Structure

### Backend/Docker (Root Directory)

```
.env.example          # Template (tracked in Git)
.env.dev             # Development config (gitignored)
.env.test            # Testing config (gitignored)
.env.prod            # Production config (gitignored)
```

**Setup**:

```bash
cp .env.example .env.dev
# Edit .env.dev with your values
```

**Docker Compose Mapping**:

- `docker-compose.dev.yaml` → `.env.dev`
- `docker-compose.test.yaml` → `.env.test`
- `docker-compose.prod.yaml` → `.env.prod`

### Frontend (Website Directory)

```
.env.local           # Local development (gitignored)
.env.production      # Production (gitignored)
```

**Setup**:

```bash
cd Website
touch .env.local
# Add frontend variables
```

## Variable Reference Table

| Variable                            | Backend | Frontend | Docker | Required | Notes                     |
| ----------------------------------- | :-----: | :------: | :----: | :------: | ------------------------- |
| **Database**                        |
| `DB_SERVER`                         |    ✓    |          |   ✓    |  Yes\*   | SQL Server address        |
| `DB_NAME`                           |    ✓    |          |   ✓    |  Yes\*   | Database name             |
| `DB_USER`                           |    ✓    |          |   ✓    |  Yes\*   | SQL username              |
| `DB_PASSWORD`                       |    ✓    |          |   ✓    |  Yes\*   | SQL password              |
| `DB_CONNECTION_STRING`              |    ✓    |          |        |  Yes\*   | Alternative to components |
| `DB_TRUST_SERVER_CERTIFICATE`       |    ✓    |          |   ✓    |    No    | Defaults to True          |
| `SA_PASSWORD`                       |         |          |   ✓    |   Yes    | SQL Server container      |
| **Authentication (Backend - JWT)**  |
| `ACCESS_TOKEN_SECRET`               |    ✓    |          |   ✓    |   Yes    | Access token secret       |
| `REFRESH_TOKEN_SECRET`              |    ✓    |          |   ✓    |   Yes    | Refresh token secret      |
| `CONFIRMATION_TOKEN_SECRET`         |    ✓    |          |   ✓    |   Yes    | Confirmation token secret |
| **Authentication (Frontend)**       |
| `CONFIRMATION_TOKEN_SECRET`         |         |    ✓     |        |   Yes    | Email confirmation        |
| `RESET_PASSWORD_TOKEN_SECRET`       |         |    ✓     |        |   Yes    | Password reset            |
| `SESSION_SECRET`                    |         |    ✓     |        |   Yes    | Session signing           |
| `SESSION_TOKEN_NAME`                |         |    ✓     |        |    No    | Default: "biergarten"     |
| `SESSION_MAX_AGE`                   |         |    ✓     |        |    No    | Default: 604800           |
| **Base Configuration**              |
| `BASE_URL`                          |         |    ✓     |        |   Yes    | App base URL              |
| `NODE_ENV`                          |         |    ✓     |        |   Yes    | Node environment          |
| `ASPNETCORE_ENVIRONMENT`            |    ✓    |          |   ✓    |   Yes    | ASP.NET environment       |
| `ASPNETCORE_URLS`                   |    ✓    |          |   ✓    |   Yes    | API binding address       |
| **Database (Frontend - Current)**   |
| `POSTGRES_PRISMA_URL`               |         |    ✓     |        |   Yes    | Pooled connection         |
| `POSTGRES_URL_NON_POOLING`          |         |    ✓     |        |   Yes    | Direct connection         |
| `SHADOW_DATABASE_URL`               |         |    ✓     |        |    No    | Prisma shadow DB          |
| **External Services**               |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` |         |    ✓     |        |   Yes    | Public, client-side       |
| `CLOUDINARY_KEY`                    |         |    ✓     |        |   Yes    | Server-side               |
| `CLOUDINARY_SECRET`                 |         |    ✓     |        |   Yes    | Server-side               |
| `MAPBOX_ACCESS_TOKEN`               |         |    ✓     |        |   Yes    | Maps/geocoding            |
| `SPARKPOST_API_KEY`                 |         |    ✓     |        |   Yes    | Email service             |
| `SPARKPOST_SENDER_ADDRESS`          |         |    ✓     |        |   Yes    | From address              |
| **Other**                           |
| `ADMIN_PASSWORD`                    |         |    ✓     |        |    No    | Seeding only              |
| `CLEAR_DATABASE`                    |    ✓    |          |   ✓    |    No    | Dev/test only             |
| `ACCEPT_EULA`                       |         |          |   ✓    |   Yes    | SQL Server EULA           |
| `MSSQL_PID`                         |         |          |   ✓    |    No    | SQL Server edition        |
| `DOTNET_RUNNING_IN_CONTAINER`       |    ✓    |          |   ✓    |    No    | Container flag            |

\* Either `DB_CONNECTION_STRING` OR the component variables (`DB_SERVER`, `DB_NAME`,
`DB_USER`, `DB_PASSWORD`) must be provided.

## Validation

### Backend Validation

Variables are validated at startup:

- Missing required variables cause application to fail
- JWT_SECRET length is enforced (min 32 chars)
- Connection string format is validated

### Frontend Validation

Zod schemas validate variables at runtime:

- Type checking (string, number, URL, etc.)
- Format validation (email, URL patterns)
- Required vs optional enforcement

**Location**: `src/Website/src/config/env/index.ts`

## Example Configuration Files

### `.env.dev` (Backend/Docker)

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

### `.env.local` (Frontend)

```bash
# Base
BASE_URL=http://localhost:3000
NODE_ENV=development

# Authentication
SESSION_SECRET=<generated-with-openssl>

# Database (current Prisma setup)
POSTGRES_PRISMA_URL=postgresql://user:pass@db.neon.tech/biergarten?pgbouncer=true
POSTGRES_URL_NON_POOLING=postgresql://user:pass@db.neon.tech/biergarten

# External Services
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=my-cloud
CLOUDINARY_KEY=123456789012345
CLOUDINARY_SECRET=abcdefghijklmnopqrstuvwxyz
MAPBOX_ACCESS_TOKEN=pk.eyJ...
SPARKPOST_API_KEY=abc123...
SPARKPOST_SENDER_ADDRESS=noreply@biergarten.app

# Admin (for seeding)
ADMIN_PASSWORD=Admin_Dev_Password_123!
```
