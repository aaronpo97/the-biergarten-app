# The Biergarten Data Pipeline (Current — Synchronous Data Path)

The only concurrency in the current pipeline is a dedicated log dispatcher thread that drains `log_channel` and forwards entries to spdlog for the entire run (joined during shutdown after `log_channel` closes). `BiergartenPipelineOrchestrator::Run()` itself is synchronous — sampling, enrichment, generation, and export all happen on the main thread.

```mermaid
--8<-- "diagrams/pipeline/current/activity.mmd"
```
