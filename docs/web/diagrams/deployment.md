# Docker Deployment Architecture

Five diagrams, one per Compose file — mixing all five networks in one graph
made it impossible to tell which containers actually talk to each other.
Solid arrows are real container traffic; dashed arrows are `depends_on`
startup gating with no data flowing over them.

## Development (`docker-compose.dev.yaml`)

```mermaid
--8<-- "web/diagrams/deployment/dev.mmd"
```

## Test (`docker-compose.test.yaml`)

```mermaid
--8<-- "web/diagrams/deployment/test.mmd"
```

## Production (`docker-compose.prod.yaml`)

```mermaid
--8<-- "web/diagrams/deployment/prod.mmd"
```

## Database-only (`docker-compose.db.yaml`)

```mermaid
--8<-- "web/diagrams/deployment/db-only.mmd"
```

## Minimal (`docker-compose.min.yaml`)

```mermaid
--8<-- "web/diagrams/deployment/minimal.mmd"
```

## Notes

| Environment                          | Details                                                                                                                                                                                                                                                                                                                                                         |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Dev network** (`devnet`, bridge)   | Internal DNS resolves service names such as `sqlserver` and `api.core`. Volumes: `sqlserverdata-dev`, `nuget-cache-dev`, `seaweedfsdata-dev`. Startup order: SQL Server (health check) → migrations (run-once) → seed (run-once, depends on `seaweedfs`) → API (long-running, depends on seed).                                                                 |
| **Test network** (`testnet`, bridge) | All test components are isolated; fresh DB instance each run (`CLEAR_DATABASE=true`, ephemeral `sqlserverdata-test` / `seaweedfsdata-test` volumes). `api.specs`, `unit.tests`, and `frontend.tests` all run as separate containers, in parallel once seeding completes; results are aggregated.                                                                |
| **Prod network** (`prodnet`, bridge) | Isolated from dev/test networks. Volumes: `sqlserverdata-prod`, `nuget-cache-prod`. No seed step in production.                                                                                                                                                                                                                                                 |
| **Database-only environment**        | Same devnet volumes/images as `docker-compose.dev.yaml`, minus `api.core`, `frontend`, and `mailpit` — for working against the database (and object storage, since `seaweedfs` is still included) without running the API or website.                                                                                                                           |
| **Minimal environment**              | Database + migrations + seed + `seaweedfs` + mailpit, no API or frontend container — for frontend development against an `API.Core` process run outside Docker.                                                                                                                                                                                                 |
| `unit.tests`                         | Builds `Dockerfile.tests`, which restores/builds against `Biergarten.API.slnx` and then runs `dotnet test` for every `Features/*.Tests` project in turn (`Features.Users.Tests`, `Features.Breweries.Tests`, `Features.Emails.Tests`, `Features.PhotoUpload.Tests`), mocking each handler's repository/service dependencies with Moq — no real database needed. |
| `.trx` results                       | Readable by Visual Studio, Azure DevOps, and GitHub Actions.                                                                                                                                                                                                                                                                                                    |
