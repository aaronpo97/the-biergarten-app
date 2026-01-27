# The Biergarten App

## Overview

The Biergarten App is evolving from a standalone full‑stack Next.js application into a multi‑project monorepo with a dedicated .NET backend and a SQL‑first approach. Backend data access is being refactored to use stored procedures, with future microservices planned for image upload, mapping, and possibly authentication. The Next.js site remains the frontend and will consume the .NET API.

Status note (Jan 26, 2026): Migration is in progress; some parts are still being moved from the website into the .NET layers.

### Current Status

- Refactor is not complete; expect mixed responsibilities and evolving APIs.
- The Next.js app in [Website](Website) currently runs standalone, retaining its serverless API routes, Prisma, and Neon Postgres stack as documented in [Website/README.old.md](Website/README.old.md).
- The .NET API and SQL‑first repository are under active development; endpoint parity with the legacy Next.js backend is in progress.
- Planned outcome: the Website will call the .NET API and deprecate its internal backend once parity is reached.

## Repository Structure

- [API](API)
	- [API.Core](API/API.Core): ASP.NET Core Web API with controllers and OpenAPI/Swagger enabled.
- [Database](Database)
	- [Database.Core](Database/Database.Core): SQL schema and logic deployment via DbUp (scripts embedded in the assembly). SQL‑first with stored procedures.
	- [Database.Seed](Database/Database.Seed): Seeders for initial data (users, locations) driven by `DB_CONNECTION_STRING`.
- [Repository](Repository)
	- [Repository.Core](Repository/Repository.Core): Data access layer using stored procedures. Includes `DefaultSqlConnectionFactory` that reads `DB_CONNECTION_STRING` or `ConnectionStrings:Default`.
	- [Repository.Tests](Repository/Repository.Tests): Tests for repository functionality.
- [Service](Service)
	- [Service.Core](Service/Service.Core): Business/service layer consumed by the API.
- [Website](Website): Next.js frontend. Historically included serverless API routes, Prisma, and Neon Postgres; now focuses on UI and calls the .NET backend.
- [docker-compose.yml](docker-compose.yml): Local SQL Server service for development.
- [LICENSE.md](LICENSE.md): Project license.

## Tech Highlights

- Backend: ASP.NET Core Web API, SQL Server, stored procedures, DbUp for migrations and deployments.
- Data Access: Repository pattern over stored procedures (`Repository.Core`).
- Services: Encapsulated business logic (`Service.Core`).
- Frontend: Next.js with TailwindCSS, Headless UI, DaisyUI, Mapbox, Cloudinary integrations. See [Website/README.old.md](Website/README.old.md) for prior app details and envs.

## Local Development

### Prerequisites

- .NET SDK 10+ (or compatible with the solution)
- Node.js 18+
- Docker Desktop (for local SQL Server)

### 1) Start SQL Server

Create a `.env` in the repo root with at least:

```bash
SA_PASSWORD=YourStrong!Passw0rd
```

Start the container:

```bash
docker compose up -d sqlserver
```

### 2) Configure database connection

Most projects read `DB_CONNECTION_STRING`. On macOS/zsh:

```bash
export DB_CONNECTION_STRING="Server=localhost,1433;Database=biergarten;User Id=sa;Password=$SA_PASSWORD;TrustServerCertificate=True;"
```

Alternatively, add `ConnectionStrings:Default` in `API/API.Core/appsettings.json`.

### 3) Apply schema and stored procedures

Run DbUp to provision the database (scripts embedded in `Database.Core`):

```bash
dotnet run --project Database/Database.Core
```

### 4) Seed initial data

```bash
dotnet run --project Database/Database.Seed
```

### 5) Run the API

```bash
dotnet run --project API/API.Core
```

Swagger/OpenAPI UI is available when running (e.g., https://localhost:5001/swagger or the port shown on startup). The project also maps an OpenAPI document via `MapOpenApi()`.

### 6) Run the Website (frontend)

```bash
cd Website
npm install
npm run dev
```

For environment variables (Cloudinary, Mapbox, Prisma/Neon, etc.), see [Website/README.old.md](Website/README.old.md).

Note: At present, the Website runs standalone and uses its existing serverless backend (Next.js API routes + Prisma/Neon). Integration to the .NET API is planned and will replace those routes once feature parity is achieved.

## Roadmap

- Complete migration of backend logic from Next.js to .NET.
- Expand stored procedure coverage for CRUD and domain operations.
- Introduce microservices for image upload and mapping; evaluate auth as a separate service.
- Harden CI/CD, testing, and observability across API, repository, and services.

## License

See [LICENSE.md](LICENSE.md).

