# Legacy Website Archive (`src/Website-v1`)

This archive captures high-level notes about the previous Biergarten frontend so active
project documentation can focus on the current website in `src/Website`.

## Status

- `src/Website-v1` is retained for historical reference only
- It is not the active frontend used by current setup, docs, or testing guidance
- New product and engineering work should target `src/Website`

## Legacy Stack Summary

The archived frontend used a different application model from the current website:

- Next.js 14
- React 18
- Prisma
- Postgres / Neon-hosted database workflows
- Next.js API routes and server-side controllers
- Additional third-party integrations such as Cloudinary, Mapbox, and SparkPost

## Why It Was Archived

The active website moved to a React Router-based frontend that talks directly to the .NET
API. As part of that shift, the main docs were updated to describe:

- `src/Website` as the active frontend
- React Router route modules and server rendering
- Storybook-based component documentation and tests
- Current frontend runtime variables: `API_BASE_URL`, `SESSION_SECRET`, and `NODE_ENV`

## Legacy Documentation Topics Moved Out of Active Docs

The following categories were removed from active documentation and intentionally archived:

- Next.js application structure guidance
- Prisma and Postgres frontend setup
- Legacy frontend environment variables
- External service setup that only applied to `src/Website-v1`
- Old frontend local setup instructions

## When To Use This Archive

Use this file only if you need to:

- inspect the historical frontend implementation
- compare old flows against the current website
- migrate or recover legacy logic from `src/Website-v1`

For all active work, use:

- [Getting Started](../getting-started.md)
- [Architecture](../architecture.md)
- [Environment Variables](../environment-variables.md)
- [Testing](../testing.md)
