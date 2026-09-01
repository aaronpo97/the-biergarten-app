# Docker Deployment Architecture

```mermaid
--8<-- "web/diagrams/deployment.mmd"
```

## Notes

- **Dev network** (`biergarten-dev`, bridge): internal DNS resolves `sql-server` and `api`. Volumes: `biergarten-dev-data`. Startup order: SQL Server (health check) → migrations (run-once) → seed (run-once) → API (long-running).
- **Test network** (`biergarten-test`, bridge): all test components isolated; fresh DB instance each run (`CLEAR_DATABASE=true`, ephemeral `biergarten-test-data` volume). All tests run in parallel, results aggregated.
- **Prod network** (`prodnet`, bridge): isolated from dev/test networks. Volumes: `sqlserverdata-prod`, `nuget-cache-prod`. No seed step in production.
- **Database-only environment**: same devnet volumes/images as `docker-compose.dev.yaml`, minus `api.core` and `mailpit` — for working against the database without running the API.
- **Minimal environment**: database + mailpit only, no API container — for frontend development against an `API.Core` process run outside Docker.
- `unit.tests` builds `Dockerfile.tests`, which restores/builds against `Core.slnx` then runs `dotnet test` for every `Features/*.Tests` project in turn (`Features.Users.Tests`, `Features.Breweries.Tests`, `Features.Emails.Tests`), mocking each handler's repository/service dependencies with Moq — no real database needed.
- `.trx` results are readable by Visual Studio, Azure DevOps, and GitHub Actions.
