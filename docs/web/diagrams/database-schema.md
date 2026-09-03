# Database Schema

Six diagrams, one per SQL Server schema — mirrors the `Auth` / `Geolocation` /
`Media` / `Brewery` / `Beer` / `Social` schema split under
`web/backend/Database/Database.Migrations/scripts/`. Every table also has a
`RowVersion ROWVERSION` column (optimistic concurrency), omitted below for
brevity. Tables marked `(*)` have no repository/feature slice yet.

Boxes with no attribute list (e.g. `Photo` in the auth diagram) are owned by a
different schema and shown only to keep the relationship visible; see the
diagram named after that schema for its full definition.

## Auth (`Auth`)

```mermaid
--8<-- "web/diagrams/database-schema/auth.mmd"
```

## Social (`Social`)

```mermaid
--8<-- "web/diagrams/database-schema/social.mmd"
```

## Media (`Media`)

```mermaid
--8<-- "web/diagrams/database-schema/media.mmd"
```

## Geolocation (`Geolocation`)

```mermaid
--8<-- "web/diagrams/database-schema/geolocation.mmd"
```

## Brewery (`Brewery`)

```mermaid
--8<-- "web/diagrams/database-schema/brewery.mmd"
```

## Beer (`Beer`)

```mermaid
--8<-- "web/diagrams/database-schema/beer.mmd"
```
