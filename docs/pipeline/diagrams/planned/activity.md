# The Biergarten Data Pipeline — Activity Diagram (Planned)

Each generation phase runs a producer/consumer chain concurrently: an
**Orchestrator** producer feeds a bounded channel, an **LLM Worker** consumes it
and generates records (closing its output channel when the input is drained and
closed), and a **SQLite Worker** consumes that output channel and commits in
batches. The brewery phase inserts a fourth stage, a **Geocode Worker**, between
the LLM Worker and the SQLite Worker: reverse-geocoding is network-bound and
rate-limited independently of LLM inference (Nominatim's 1-request-per-second
policy), so keeping it off the LLM Worker's thread means neither stage stalls
waiting on the other's bottleneck. The Checkin and Follow phases run in parallel
with each other once the user and brewery pools are populated.

```mermaid
--8<-- "pipeline/diagrams/planned/activity.mmd"
```
