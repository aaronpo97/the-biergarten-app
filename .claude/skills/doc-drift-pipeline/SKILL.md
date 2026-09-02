---
name: doc-drift-pipeline
description: Checks whether recent changes under tooling/pipeline/ have made docs/pipeline/ stale. Use when the user asks to check for doc drift on the pipeline, before committing changes to tooling/pipeline, or when asked "does this need a doc update" for the C++ seed-data pipeline.
---

# Doc Drift Check — Pipeline

Given a diff scoped to `tooling/pipeline/` (uncommitted changes, a range of
commits, or a specific PR), determine whether it invalidates any factual
claim in `docs/pipeline/`.

## Steps

1. Run `git diff -- tooling/pipeline/` (or
   `git diff <base>...<head> -- tooling/pipeline/` if a range is given) to
   see what changed. If the diff also touches `web/**`, note that it's out of
   scope here — use the `doc-drift-web` skill for that half.
2. Based on which files changed, identify the relevant doc(s):
   - `tooling/pipeline/src/**`, `includes/**` (implemented behavior) →
     `docs/pipeline/README.md`, `docs/pipeline/diagrams/current/*.mmd`
     (activity, class)
   - Work that's scaffolded/flagged but not wired into the default run path
     (roadmap-only) → `docs/pipeline/ROADMAP.md`,
     `docs/pipeline/diagrams/planned/*.mmd` — do not touch `current/` for
     planned work that hasn't landed
   - Changes to pipeline bias/hallucination handling, model prompts, sampling
     logic, or known-limitation workarounds →
     `docs/pipeline/ETHICS-AND-KNOWN-ISSUES.md`
   - `tooling/pipeline/runpod/Dockerfile`, build/run scripts →
     `docs/pipeline/README.md` (setup/usage sections)
   - `docs/pipeline/french-cities.example` — check it still matches the input
     schema the pipeline actually reads
   - A new file added under `docs/pipeline/**` → also check `docs/index.md`
     and `mkdocs.yml` nav are updated to reference it
3. Read the relevant doc section(s) and check each specific factual claim
   (tables, "currently X", "not yet implemented", roadmap checkboxes) against
   the diff. For diagrams, this means reading the `.mmd` source (not just the
   wrapping `.md`) and checking nodes/edges/labels against the diff — a
   pipeline stage or control-flow change can invalidate a diagram without
   touching any prose.
4. When a diff adds real behavior that was previously only in
   `diagrams/planned/`, check whether that planned diagram/roadmap entry
   should now move to `current/`/README rather than just adding a duplicate
   claim in both places.
5. Report only what's actually stale — do not rewrite unrelated prose, do not
   invent claims not grounded in the diff.
6. If nothing is affected, say so plainly and make no edits.
7. For confirmed drift, propose the exact edit (old text → new text, or the
   changed `.mmd` node/edge) rather than committing directly, unless
   explicitly told to apply it. Flag `.mmd` changes separately since they may
   need a re-render (`docs/rendered-diagrams/pipeline/**`) via
   `docs/makefile`.
