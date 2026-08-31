# Database

SQL Server 2022 schema, migration approach, and the app's SQL error-handling
convention. For the vertical-slice code that talks to this schema, see
[Architecture](../architecture.md).

## Schema

The full schema lives under
`web/backend/Database/Database.Migrations/scripts/01-schema/`, one numbered
script per table (`01-UserAccount.sql`, `02-Photo.sql`, ...), run in order by
`Database.Migrations` (DbUp) on startup. Each table is queried directly by the
owning feature slice's repository (see
[Direct SQL via Dapper/ADO.NET](../architecture.md#direct-sql-via-dapperadonet)).

A generated DBML copy of the schema (for import into a diagramming tool such
as dbdiagram.io) lives at
`web/backend/Database/Database.Migrations/schema.dbml`.

All tables use a `UNIQUEIDENTIFIER` primary key defaulting to `NEWID()`, and
most carry a `RowVersion ROWVERSION` column used for optimistic concurrency on
updates (`UPDATE ... WHERE ... AND RowVersion = @RowVersion`).

### Tables backed by the API today

| Table                 | Backed by                                                                | Notes                                                                                                                                                                  |
| --------------------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `UserAccount`         | `Domain.Entities.UserAccount`, `Features.Users`                          | `Username` and `Email` are unique                                                                                                                                      |
| `UserCredential`      | `Domain.Entities.UserCredential`, `Features.Users`                       | Argon2id password hash; `IsRevoked`/`RevokedAt` track credential rotation, not JWTs                                                                                    |
| `UserVerification`    | `Domain.Entities.UserVerification`, `Features.Users`                     | Written when a user confirms their email                                                                                                                               |
| `UserProfile`         | `Domain.Entities.UserProfile`, `Features.Users`                          | 1:1 with `UserAccount`; holds the user's biography; written via `IUserProfileRepository`                                                                              |
| `UserAvatar`          | `Domain.Entities.UserAvatar`, `Features.Users`                           | Links a `UserProfile` to a `Photo` as its avatar; written via `IUserProfileRepository.SaveAvatarAsync`                                                                 |
| `BreweryPost`         | `Domain.Entities.BreweryPost`, `Features.Breweries`                      | A user-submitted brewery listing                                                                                                                                       |
| `BreweryPostLocation` | `Domain.Entities.BreweryPostLocation`, `Features.Breweries`              | 1:1 with `BreweryPost`; `Coordinates` is a `GEOGRAPHY` column, read via a plain Dapper query that selects `CONVERT(varbinary(max), Coordinates)`, since Dapper can't deserialize SQL Server UDTs directly |
| `City`                | `Domain.Entities.City`, `Features.Locations`                             | Referenced by `BreweryPostLocation.CityID`; written via `ILocationRepository`, read via `ILocationRepository` and `IBreweryRepository`'s location joins, currently written only by `Database.Seed` |
| `StateProvince`       | `Domain.Entities.StateProvince`, `Features.Locations`                    | Referenced by `City.StateProvinceID`; created on demand by `ILocationRepository.GetOrCreateCityIdAsync`, read via `IBreweryRepository`'s location joins |
| `Country`             | `Domain.Entities.Country`, `Features.Locations`                          | Referenced by `StateProvince.CountryID`; created on demand by `ILocationRepository.GetOrCreateCityIdAsync`, read via `IBreweryRepository`'s location joins |
| `Photo`               | `Domain.Entities.Photo`, `Features.PhotoUpload`                          | Written via `IPhotoUploadRepository.CreateAsync`, sent as an `UploadPhotoCommand` from other features' handlers; not yet seeded by `Database.Seed` |

### Tables defined in the schema but not yet wired to a feature slice

These exist so the schema can support planned functionality, but have no
repository or seed data yet:

| Table              | Purpose (from schema)                                                                                    |
| ------------------ | -------------------------------------------------------------------------------------------------------- |
| `UserFollow`       | One user following another (`CannotFollowOwnAccount` check constraint)                                   |
| `BeerStyle`        | A beer style/category; has a `Domain.Entities.BeerStyle` type, but no repository yet                     |
| `BeerPost`         | A beer listing, linked to a `BreweryPost` and `BeerStyle`; `ABV`/`IBU` are constrained (`0-67`, `0-120`); has a `Domain.Entities.BeerPost` type, but no repository yet |
| `BeerPostPhoto`    | Links a `BeerPost` to a `Photo`                                                                          |
| `BeerPostComment`  | A comment + 1-5 `Rating` on a `BeerPost`                                                                 |
| `BreweryPostPhoto` | Links a `BreweryPost` to a `Photo`                                                                       |

## Migrations

**Tool**: DbUp, run by the `Database.Migrations` project/container.

Scripts live under `scripts/`, applied in order and tracked so a script never
re-runs once it has succeeded. Today that's `01-schema/`, with one script per
table, numbered so a table's foreign keys always point at an earlier-numbered
script. When the schema needs to change, add a new numbered script rather than
editing an existing one in place — DbUp's tracking is per-script, so editing
an already-applied script means it won't re-run against existing databases.

## Data seeding

`Database.Seed` populates a target database from data produced by the C++
pipeline (see [Pipeline README](../pipeline/README.md)): countries,
state/provinces, and cities (created on demand while resolving each brewery's
location), user accounts, and brewery posts with locations. It doesn't call
every feature slice that has a write path — `Photo`, for example, has a
repository (`Features.PhotoUpload`) but no seed data.

## Database error handling

- Optimistic-concurrency conflicts are detected by an `UPDATE` affecting zero
  rows against the `RowVersion` column.
- On failure, the repository throws a `Domain.Exceptions` type directly
  (`NotFoundException`, `ConflictException`, `ArgumentException`, ...).
  `API.Core`'s `GlobalExceptionFilter` maps these to HTTP status codes (404,
  409, 400, ...); an unmapped `SqlException` (e.g. a genuine connectivity or
  constraint-violation failure) maps to 503.

  - One exception: `Features.Users`' `DapperUserStore` does catch
    `SqlException` directly, to detect a duplicate-key race (SQL Server error
    2601 or 2627) when two requests try to verify the same account
    concurrently — see `DapperUserStore.IsDuplicateKeyViolation`.
