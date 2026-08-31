# The Biergarten App — Vertical Slice Architecture

```mermaid
flowchart TB
    subgraph HOST["API.Core (thin host)"]
        API["API.Core<br/>ASP.NET Core Web API host"]
    end

    subgraph SLICES["Feature Slices"]
        UsersSlice["Features.Users"]
        BrewerySlice["Features.Breweries"]
        EmailsSlice["Features.Emails<br/>(no controller)"]
        LocationsSlice["Features.Locations<br/>(no controller, no MediatR)"]
    end

    subgraph SHARED["Shared"]
        SharedContracts["Shared.Contracts"]
        SharedApp["Shared.Application"]
    end

    subgraph INFRA["Infrastructure Layer"]
        Sql["Infrastructure.Sql"]
        JWT["Infrastructure.Jwt"]
        PwdHash["Infrastructure.PasswordHashing"]
        Email["Infrastructure.Email"]
        EmailTemplates["Infrastructure.Email.Templates"]
    end

    subgraph DOMAIN["Domain Layer"]
        Domain["Domain.Entities"]
        DomainExceptions["Domain.Exceptions"]
    end

    Tables[("SQL Server<br/>Tables")]
    Seed["Database.Seed<br/>(separate console app)"]

    API -.->|AddApplicationPart| UsersSlice
    API -.->|AddApplicationPart| BrewerySlice
    API -.->|MediatR scan only| EmailsSlice

    Seed -.->|AddFeaturesUsers| UsersSlice
    Seed -.->|AddFeaturesBreweries| BrewerySlice
    Seed -.->|AddFeaturesLocations| LocationsSlice

    UsersSlice --> Sql
    UsersSlice --> JWT
    UsersSlice --> PwdHash
    UsersSlice --> SharedContracts
    UsersSlice --> SharedApp

    BrewerySlice --> Sql
    BrewerySlice --> SharedContracts
    BrewerySlice --> SharedApp

    LocationsSlice --> Sql

    EmailsSlice --> Email
    EmailsSlice --> EmailTemplates
    EmailsSlice --> SharedApp

    UsersSlice -.->|sends SendRegistrationEmailCommand| SharedApp
    EmailsSlice -.->|handles SendRegistrationEmailCommand| SharedApp

    Sql --> Domain

    UsersSlice --> Tables
    BrewerySlice --> Tables
    LocationsSlice --> Tables

    UsersSlice --> Domain
    BrewerySlice --> Domain
    LocationsSlice --> Domain
    UsersSlice --> DomainExceptions
```

## Notes

- **API.Core**: Program.cs wiring only — MediatR + `AddApplicationPart` per `Features.*` assembly, Swagger/OpenAPI, health checks, JWT auth middleware, global exception filter.
- **Feature slices**: each owns its own controller (HTTP endpoints), commands/queries + handlers, validators, and Dapper repository. `Features.Users` covers auth (`Commands/Authentication`), account management (`Commands/Account`), and profile/avatar (`Commands/Profile`). `Features.Emails` has no controller — invoked only via MediatR commands sent from other slices. `Features.Locations` has no controller and no MediatR handlers — it exposes `ILocationRepository` directly as a plain DI service, not registered by `API.Core` at all; only `Database.Seed` depends on it today.
- **Shared.Application**: `ValidationBehavior` (MediatR pipeline) plus the cross-slice email commands (`SendRegistrationEmailCommand`, `SendResendConfirmationEmailCommand`) — the one cross-slice interaction is a MediatR command contract, not a project reference.
- **Domain.Entities**: `UserAccount`, `UserCredential`, `UserVerification`, `UserProfile`, `UserAvatar`, `BreweryPost`, `BreweryPostLocation`, `City`, `StateProvince`, `Country`, `BeerPost`, `BeerStyle` (schema tables exist for the last two; no repository yet).
- **Infrastructure.Sql**: SQL-first approach — each slice's own repository issues inline SQL via Dapper, no ORM, no stored procedures.
- **Database.Seed**: calls each slice's `AddFeatures*()` DI extension directly — no API host, no MediatR pipeline.
- No `Features.*` project ever references another `Features.*` project directly.
