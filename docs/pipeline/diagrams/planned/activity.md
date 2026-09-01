# The Biergarten Data Pipeline — Activity Diagram (Planned)

Each generation phase runs a producer/consumer trio concurrently: an
**Orchestrator** producer feeds a bounded channel, an **LLM Worker** consumes it
and generates records (closing its output channel when the input is drained and
closed), and a **SQLite Worker** consumes that output channel and commits in
batches. The Checkin and Follow phases run in parallel with each other once the
user and brewery pools are populated.

```mermaid
--8<-- "pipeline/diagrams/planned/activity.mmd"
```
