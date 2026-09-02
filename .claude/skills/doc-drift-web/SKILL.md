---
name: doc-drift-web
description: Checks whether recent changes under web/ have made docs/web/ stale. Use when the user asks to check for doc drift on the web app, before committing changes to web/backend or web/frontend, or when asked "does this need a doc update" for web/API/frontend work.
---

# Doc Drift Check — Web

Given a diff scoped to `web/` (uncommitted changes, a range of commits, or a
specific PR), determine whether it invalidates any factual claim in
`docs/web/`.

## Steps

1. Run `git diff -- web/` (or `git diff <base>...<head> -- web/` if a range is
   given) to see what changed. If the diff also touches `tooling/pipeline/**`,
   note that it's out of scope here — use the `doc-drift-pipeline` skill for
   that half.
2. Based on which files changed, identify the relevant doc(s):
   - `web/backend/API/**`, `Features.*/**` (general) → `docs/web/architecture.md`
   - `web/backend/Features/Features.Users/**/Authentication/**`,
     identity/token code (`ITokenService`, `RefreshToken*`, `ConfirmEmail*`,
     login/registration handlers) → `docs/web/token-validation.md`,
     `docs/web/diagrams/auth/*.mmd` (pick the matching flow: login,
     registration, refresh-token, confirm-user, delete-account,
     update-email/password/profile/username, resend-confirmation,
     error-handling)
   - `web/backend/Database/**` (entities, `Database.Migrations/scripts/**`) →
     `docs/web/database.md`, `docs/web/diagrams/database-schema/*.mmd` (pick
     the matching schema: beer, brewery, identity, location, media)
   - Host wiring / DI registration (`API/**Program.cs`,
     `Database.Seed/**Program.cs`) → `docs/web/diagrams/vertical-slice/host-wiring.mmd`
   - New project references between `Features.*`/`Shared.*`/`Domain.*`
     projects (new `.csproj` `<ProjectReference>`) →
     `docs/web/diagrams/vertical-slice/project-references.mmd`
   - `web/backend/Dockerfile*`, `web/frontend/Dockerfile*`, compose/deploy
     config → `docs/web/docker.md`, `docs/web/diagrams/deployment/*.mmd`
     (dev, test, minimal, db-only, prod), `docs/web/diagrams/deployment.md`
   - `web/.env.example`, `web/.env.test`, appsettings → `docs/web/environment-variables.md`
   - `web/backend/API/API.Specs/**`, test infra/fixtures → `docs/web/testing.md`
   - New backend project setup, dev tooling → `docs/web/getting-started.md`
   - `web/frontend/**` → `docs/web/architecture.md` (Frontend architecture section)
   - A new file added under `docs/web/**` → also check `docs/index.md` and
     `mkdocs.yml` nav are updated to reference it
3. Read the relevant doc section(s) and check each specific factual claim
   (tables, "currently X", "not yet implemented", roadmap checkboxes) against
   the diff. For diagrams, this means reading the `.mmd` source (not just the
   wrapping `.md`) and checking nodes/edges/labels against the diff — a
   schema or flow change can invalidate a diagram without touching any prose.
4. Report only what's actually stale — do not rewrite unrelated prose, do not
   invent claims not grounded in the diff.
5. If nothing is affected, say so plainly and make no edits.
6. For confirmed drift, propose the exact edit (old text → new text, or the
   changed `.mmd` node/edge) rather than committing directly, unless
   explicitly told to apply it. Flag `.mmd` changes separately since they may
   need a re-render (`docs/rendered-diagrams/web/**`) via `docs/makefile`.
