# Docker Deployment Architecture

```mermaid
--8<-- "web/diagrams/deployment.mmd"
```

## Notes

- **Dev network** (`devnet`, bridge): internal DNS resolves service names such as `sqlserver` and `api.core`. Volumes: `sqlserverdata-dev`, `nuget-cache-dev`, `seaweedfsdata-dev`. Startup order: SQL Server (health check) → migrations (run-once) → seed (run-once, depends on `seaweedfs`) → API (long-running, depends on seed).
- **Test network** (`testnet`, bridge): all test components isolated; fresh DB instance each run (`CLEAR_DATABASE=true`, ephemeral `sqlserverdata-test`/`seaweedfsdata-test` volumes). `api.specs`, `unit.tests`, and `frontend.tests` all run as separate containers, results aggregated.
- **Prod network** (`prodnet`, bridge): isolated from dev/test networks. Volumes: `sqlserverdata-prod`, `nuget-cache-prod`. No seed step in production.
- **Database-only environment**: same devnet volumes/images as `docker-compose.dev.yaml`, minus `api.core`, `frontend`, and `mailpit` — for working against the database (and object storage, since `seaweedfs` is still included) without running the API or website.
- **Minimal environment**: database + migrations + seed + `seaweedfs` + mailpit, no API or frontend container — for frontend development against an `API.Core` process run outside Docker.
- `unit.tests` builds `Dockerfile.tests`, which restores/builds against `Biergarten.API.slnx` then runs `dotnet test` for every `Features/*.Tests` project in turn (`Features.Users.Tests`, `Features.Breweries.Tests`, `Features.Emails.Tests`, `Features.PhotoUpload.Tests`), mocking each handler's repository/service dependencies with Moq — no real database needed.
- `.trx` results are readable by Visual Studio, Azure DevOps, and GitHub Actions.
