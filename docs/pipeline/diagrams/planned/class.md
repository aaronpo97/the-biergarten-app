# Biergarten Data Pipeline — Class Diagram (Planned)

```mermaid
--8<-- "pipeline/diagrams/planned/class.mmd"
```

## Notes

- `Logger`, `PipelineLogger`, and `LogWorker` are referenced only in
  relationships in the source PlantUML (not given their own class blocks there
  either) — they appear here as implicit nodes for the same reason.
- Package grouping from the PlantUML source (`Domain: Models`,
  `Domain: Application Configuration`, `Domain: Policy`,
  `Infrastructure: Logging`, `Infrastructure: Pipeline Channel`,
  `Infrastructure: Data Preloading`, `Infrastructure: Enrichment`,
  `Infrastructure: Prompting`, `Infrastructure: Data Generation`,
  `Infrastructure: Data Export`) is preserved as Mermaid `namespace` blocks.
