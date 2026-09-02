# Database Schema

Five diagrams, one per schema category — mirrors the `identity` / `media` /
`location` / `brewery` / `beer` schema split. Every table also has a
`RowVersion ROWVERSION` column (optimistic concurrency), omitted below for
brevity. Tables marked `(*)` have no repository/feature slice yet.

Boxes with no attribute list (e.g. `Photo` in the identity diagram) are owned by
a different schema and shown only to keep the relationship visible; see the
diagram named after that schema for its full definition.

## Identity (`identity`)

```mermaid
--8<-- "web/diagrams/database-schema/identity.mmd"
```

## Media (`media`)

```mermaid
--8<-- "web/diagrams/database-schema/media.mmd"
```

## Location (`location`)

```mermaid
--8<-- "web/diagrams/database-schema/location.mmd"
```

## Brewery (`brewery`)

```mermaid
--8<-- "web/diagrams/database-schema/brewery.mmd"
```

## Beer (`beer`)

```mermaid
--8<-- "web/diagrams/database-schema/beer.mmd"
```
