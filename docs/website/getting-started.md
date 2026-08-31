---
title: Getting started — local setup for backend and frontend
last-updated: 2026-08-31
tags:
  - getting-started
  - setup
  - onboarding
---

This guide covers local setup for the Biergarten stack: the .NET backend in
`web/backend` and the React Router frontend in `web/frontend`.

## Prerequisites

- **.NET SDK 10+**
- **Node.js 18+**
- **Docker Desktop** or equivalent Docker Engine setup
- **Java 8+** if you want to regenerate PlantUML diagrams

## Recommended path: Docker for backend, Node for frontend

### 1. Clone the repository

```bash
git clone https://github.com/aaronpo97/the-biergarten-app
cd the-biergarten-app
```

### 2. Configure backend environment variables

Generate `.env.dev` with freshly randomized secrets:

```bash
cd web
./generate-env.sh .env.dev
cd ..
```

Or copy the template and fill in values manually:

```bash
cp web/.env.example web/.env.dev
```

At minimum, ensure `.env.dev` includes valid database and token values:

```bash
DB_SERVER=sqlserver,1433
DB_NAME=Biergarten
DB_USER=sa
DB_PASSWORD=YourStrong!Passw0rd
ACCESS_TOKEN_SECRET=<generated>
REFRESH_TOKEN_SECRET=<generated>
CONFIRMATION_TOKEN_SECRET=<generated>
WEBSITE_BASE_URL=http://localhost:3000
```

See [Environment Variables](environment-variables.md) for the full list, and its
[Generating an env file](environment-variables.md#generating-an-env-file)
section for details on `generate-env.sh`.

### 3. Start the backend stack

```bash
docker compose --env-file web/.env.dev -f web/docker-compose.dev.yaml up -d
```

This starts SQL Server, migrations, seeding, the API, Mailpit (local dev SMTP),
and SeaweedFS (local dev S3-compatible object storage for photo uploads).

Available endpoints:

- API Swagger: http://localhost:8080/swagger
- Health Check: http://localhost:8080/health
- Mailpit UI: http://localhost:8025
- SeaweedFS S3 API: http://localhost:8333

### 4. Start the frontend

```bash
cd web/frontend
npm install
API_BASE_URL=http://localhost:8080 SESSION_SECRET=dev-secret-change-me npm run dev
```

The website will be available at the local address printed by React Router dev.

Required frontend runtime variables for local work:

- `API_BASE_URL` - Base URL for the .NET API
- `SESSION_SECRET` - Cookie session signing secret for the website server

### 5. Optional: run Storybook

```bash
cd web/frontend
npm run storybook
```

Storybook runs at http://localhost:6006 by default.

## Useful commands

### Backend

```bash
docker compose --env-file web/.env.dev -f web/docker-compose.dev.yaml logs -f
docker compose --env-file web/.env.dev -f web/docker-compose.dev.yaml down
docker compose --env-file web/.env.dev -f web/docker-compose.dev.yaml down -v
```

### Frontend

```bash
cd web/frontend
npm run lint
npm run typecheck
npm run format:check
npm run test:storybook
npm run test:storybook:playwright
```

## Manual backend setup

If you do not want to use Docker, you can run the backend locally.

### 1. Set environment variables

```bash
export DB_CONNECTION_STRING="Server=localhost,1433;Database=Biergarten;User Id=sa;Password=YourStrong!Passw0rd;TrustServerCertificate=True;"
export ACCESS_TOKEN_SECRET="<generated>"
export REFRESH_TOKEN_SECRET="<generated>"
export CONFIRMATION_TOKEN_SECRET="<generated>"
export WEBSITE_BASE_URL="http://localhost:3000"
export SEAWEEDFS_SERVICE_URL="http://localhost:8333"
export SEAWEEDFS_ACCESS_KEY_ID="<generated>"
export SEAWEEDFS_SECRET_ACCESS_KEY="<generated>"
export SEAWEEDFS_BUCKET="my-bucket"
```

### 2. Run migrations and seed

```bash
cd web/backend
dotnet run --project Database/Database.Migrations/Database.Migrations.csproj
dotnet run --project Database/Database.Seed/Database.Seed.csproj
```

### 3. Start the API

```bash
dotnet run --project API/API.Core/API.Core.csproj
```

## Archived frontend

`archive/next-js-web-app/` contains an archived Next.js frontend, kept for
reference; it is not part of the running stack.

## Next steps

- Review [Architecture](../architecture.md)
- Run backend and frontend checks from [Testing](testing.md)
- Use [Docker Guide](docker.md) for container troubleshooting
