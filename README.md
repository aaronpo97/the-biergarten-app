# The Biergarten App

The Biergarten App is a multi-project monorepo with a .NET backend and an active React
Router frontend in `src/Website`. The current website focuses on account flows, theme
switching, shared UI components, Storybook coverage, and integration with the API.

## Documentation

- [Getting Started](docs/getting-started.md) - Local setup for backend and active website
- [Architecture](docs/architecture.md) - Current backend and frontend architecture
- [Docker Guide](docs/docker.md) - Container-based backend development and testing
- [Testing](docs/testing.md) - Backend and frontend test commands
- [Environment Variables](docs/environment-variables.md) - Active configuration reference
- [Token Validation](docs/token-validation.md) - JWT validation architecture
- [Legacy Website Archive](docs/archive/legacy-website-v1.md) - Archived notes for the old Next.js frontend

## Diagrams

- [Architecture](docs/diagrams-out/architecture.svg) - Layered architecture
- [Deployment](docs/diagrams-out/deployment.svg) - Docker topology
- [Authentication Flow](docs/diagrams-out/authentication-flow.svg) - Auth sequence
- [Database Schema](docs/diagrams-out/database-schema.svg) - Entity relationships

## Current Status

Active areas in the repository:

- .NET 10 backend with layered architecture and SQL Server
- React Router 7 website in `src/Website`
- Shared Biergarten theme system with a theme guide route
- Storybook stories and browser-based checks for shared UI
- Auth demo flows for home, login, register, dashboard, logout, and confirmation
- Toast-based feedback for auth outcomes

Legacy area retained for reference:

- `src/Website-v1` contains the archived Next.js frontend and is no longer the active website

## Tech Stack

- **Backend**: .NET 10, ASP.NET Core, SQL Server 2022, DbUp
- **Frontend**: React 19, React Router 7, Vite 7, Tailwind CSS 4, DaisyUI 5
- **UI Documentation**: Storybook 10, Vitest browser mode, Playwright
- **Testing**: xUnit, Reqnroll (BDD), FluentAssertions, Moq
- **Infrastructure**: Docker, Docker Compose
- **Security**: Argon2id password hashing, JWT access/refresh/confirmation tokens

## Quick Start

### Backend

```bash
git clone https://github.com/aaronpo97/the-biergarten-app
cd the-biergarten-app
cp .env.example .env.dev
docker compose -f docker-compose.dev.yaml up -d
```

Backend access:

- API Swagger: http://localhost:8080/swagger
- Health Check: http://localhost:8080/health

### Frontend

```bash
cd src/Website
npm install
API_BASE_URL=http://localhost:8080 SESSION_SECRET=dev-secret npm run dev
```

Optional frontend tools:

```bash
cd src/Website
npm run storybook
npm run test:storybook
npm run test:storybook:playwright
```

## Repository Structure

```text
src/Core/          Backend projects (.NET)
src/Website/       Active React Router frontend
src/Website-v1/    Archived legacy Next.js frontend
docs/              Active project documentation
docs/archive/      Archived legacy documentation
```

## Key Features

Implemented today:

- User registration and login against the API
- JWT-based auth with access, refresh, and confirmation flows
- SQL Server migrations and seed projects
- Shared form components and auth screens
- Theme switching with Lager, Stout, Cassis, and Weizen variants
- Storybook documentation and automated story interaction tests
- Toast feedback for auth-related outcomes

Planned next:

- Brewery discovery and management
- Beer reviews and ratings
- Social follow relationships
- Geospatial brewery experiences
- Additional frontend routes beyond the auth demo

## Testing

Backend suites:

- `API.Specs` - integration tests
- `Infrastructure.Repository.Tests` - repository unit tests
- `Service.Auth.Tests` - service unit tests

Frontend suites:

- Storybook interaction tests via Vitest
- Storybook browser regression checks via Playwright

Run all backend tests with Docker:

```bash
docker compose -f docker-compose.test.yaml up --abort-on-container-exit
```

See [Testing](docs/testing.md) for the full command list.

## Configuration

Common active variables:

- Backend: `DB_SERVER`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET`, `CONFIRMATION_TOKEN_SECRET`
- Frontend: `API_BASE_URL`, `SESSION_SECRET`, `NODE_ENV`

See [Environment Variables](docs/environment-variables.md) for details.

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
