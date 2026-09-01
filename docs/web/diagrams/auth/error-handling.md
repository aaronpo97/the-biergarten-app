# User Authentication Flow — Error Handling

Global exception mapping performed by `API.Core`'s `GlobalExceptionFilter`. Applies uniformly across every authentication endpoint (registration, login, refresh, confirm, resend, update-username/email/password/profile, delete-account) — see the per-flow diagrams for where each exception type is thrown.

```mermaid
--8<-- "web/diagrams/auth/error-handling.mmd"
```
