# The Biergarten App

The Biergarten App is a full-stack directory and discovery platform for
breweries. It provides:

- JWT-based user authentication, with email confirmation and refresh-token
  reissue
- A searchable database of brewery locations
- An offline data-generation pipeline that uses large language models (LLMs)
  via Llama.cpp and Wikipedia to synthesize realistic seed data

The repository is organized into:

- A .NET backend (Web API + database migrations/seed) under `web/backend/`
- A server-rendered React website (React Router + Vite) under `web/frontend/`
- A C++20 data-generation CLI under `tooling/pipeline/`

Specialized documentation (setup, architecture, docker, testing, diagrams, and
pipeline notes) lives under `docs/`.

## Documentation

Website + backend (active stack):

- [Getting Started](docs/web/getting-started.md)
- [Architecture](docs/web/architecture.md)
- [Database](docs/web/database.md)
- [Docker Guide](docs/web/docker.md)
- [Testing](docs/web/testing.md)
- [Environment Variables](docs/web/environment-variables.md)
- [Token Validation](docs/web/token-validation.md)

Data generation pipeline (C++):

- [Pipeline README](docs/pipeline/README.md)
- [Ethics & Known Issues](docs/pipeline/ETHICS-AND-KNOWN-ISSUES.md)

## Current status

Active areas in the repository:

- .NET 10 backend (vertical-slice architecture with MediatR) + SQL Server
- React 19 website (React Router 7 + Vite)
- Shared Biergarten theme system + Storybook coverage
- Auth flows and account/email integration (local Mailpit in dev compose)
- Photo upload to S3-compatible object storage (local SeaweedFS in dev compose)
- Data generation pipeline with C++ and Llama.cpp

Archived/reference areas:

- `archive/next-js-web-app/` contains an older Next.js frontend retained for
  reference

## Tech stack

- **Backend**: .NET 10, ASP.NET Core, SQL Server 2022, DbUp
- **Frontend**: React 19, React Router 7, Vite 7, Tailwind CSS 4, DaisyUI 5,
  Leaflet/React Leaflet (brewery maps)
- **UI Documentation**: Storybook 10, Vitest browser mode, Playwright
- **Testing**: xUnit, Reqnroll (BDD), FluentAssertions, Moq
- **Infrastructure**: Docker, Docker Compose
- **Security**: Argon2id password hashing, JSON Web Tokens (JWT) for
  access/refresh/confirmation
- **Data Pipeline**: C++20, CMake, Boost, libcurl, SQLite, llama.cpp

## Requirements

- .NET SDK 10 or later
- Node.js 18 or later
- Docker Desktop, or an equivalent Docker Engine setup

See [Getting Started](docs/web/getting-started.md) for the full
prerequisite list, including the pipeline's C++ toolchain.

## Quick start

For full setup details, use [Getting Started](docs/web/getting-started.md).
This section is the shortest path to a working dev environment.

### Full stack (Docker)

```bash
git clone https://github.com/aaronpo97/the-biergarten-app
cd the-biergarten-app

cp web/.env.example web/.env.dev
docker compose --env-file web/.env.dev -f web/docker-compose.dev.yaml up --build -d
```

Access:

- Website: http://localhost:3000
- API Swagger: http://localhost:8080/swagger
- Health Check: http://localhost:8080/health
- Mailpit UI (dev SMTP): http://localhost:8025
- SeaweedFS S3 API (dev object storage): http://localhost:8333

### Frontend (Node, outside Docker)

```bash
cd web/frontend
npm install
API_BASE_URL=http://localhost:8080 SESSION_SECRET=dev-secret-change-me npm run dev
```

Optional frontend tools:

```bash
cd web/frontend
npm run storybook
npm run test:storybook
npm run test:storybook:playwright
```

## Repository structure

```text
web/
  backend/          .NET API: API.Core (host), Features.* (vertical slices),
                     Shared.*, Domain.*, Infrastructure.*, Database.* projects
  frontend/         React Router website + Storybook + Playwright/Vitest

tooling/
  pipeline/         C++20 seed-data generation CLI (CMake)

docs/
  web/              Architecture, setup, docker, testing, diagrams
  pipeline/         Pipeline docs, ethics notes, diagrams

archive/
  next-js-web-app/  Older Next.js frontend (reference only)
```

## Testing

Create a test environment file, then run the full test stack (backend and
frontend) with Docker:

```bash
cp web/.env.example web/.env.test
docker compose --env-file web/.env.test -f web/docker-compose.test.yaml up --abort-on-container-exit
```

The same command runs in CI via
[`.github/workflows/tests.yml`](.github/workflows/tests.yml) on every push
and pull request to `main`. See [Testing](docs/web/testing.md) for the
full command list.

## Configuration

Common active variables:

- Backend/Docker: `DB_SERVER`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`,
  `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET`, `CONFIRMATION_TOKEN_SECRET`,
  `WEBSITE_BASE_URL`
- Frontend runtime: `API_BASE_URL`, `SESSION_SECRET`, `NODE_ENV`

See [Environment Variables](docs/web/environment-variables.md) for details.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Run the checks in [Testing](docs/web/testing.md) (backend tests,
   `npm run lint`, `npm run typecheck`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## Support

Report bugs and request features via
[GitHub Issues](https://github.com/aaronpo97/the-biergarten-app/issues).

## License

GPL-3.0. See [LICENSE.md](LICENSE.md).
