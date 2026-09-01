# Database Schema

Every table also has a `RowVersion ROWVERSION` column (optimistic concurrency), omitted below for brevity. Tables marked `(*)` have no repository/feature slice yet.

```mermaid
--8<-- "web/diagrams/database-schema.mmd"
```
