---
title: The Biergarten App
last-updated: 2026-08-31
tags:
  - overview
  - index
---

Welcome to the documentation for The Biergarten App.

## Documentation Sections

- **[Architecture](web/architecture.md)** — System design and components
- **[Website](web/getting-started.md)** — Backend and frontend documentation
- **[Pipeline](pipeline/README.md)** — Data generation pipeline

## AI Disclosure

Parts of this documentation are drafted and maintained with AI assistance
(Claude, Sonnet or Opus, via Claude Code), including prose (architecture
notes, guides) and diagrams (the Mermaid sources under `diagrams/`).
AI-authored changes are reviewed by a maintainer before merging, same as any
other contribution.

Staleness checks are partly automated too, to guard against doc-rot: the
repo's `doc-drift-web` and `doc-drift-pipeline` Claude Code skills
(`.claude/skills/`) diff recent code changes against these docs and flag
claims that may need updating.

This is separate from the pipeline's own use of AI to *generate seed data*
(brewery names, descriptions, user profiles) — see
[ETHICS-AND-KNOWN-ISSUES.md](pipeline/ETHICS-AND-KNOWN-ISSUES.md) for that
disclosure.
