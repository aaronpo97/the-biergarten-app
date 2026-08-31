# User Authentication Flow — Error Handling

Global exception mapping performed by `API.Core`'s `GlobalExceptionFilter`. Applies uniformly across every authentication endpoint (registration, login, refresh, confirm, resend, update-username/email/password/profile, delete-account) — see the per-flow diagrams for where each exception type is thrown.

```mermaid
sequenceDiagram
    participant API as API Controller

    Note over API: GlobalExceptionFilter catches:
    Note over API: FluentValidation.ValidationException → 400 Bad Request {message, errors} (grouped by property)
    Note over API: ConflictException → 409 Conflict
    Note over API: NotFoundException → 404 Not Found
    Note over API: UnauthorizedException → 401 Unauthorized
    Note over API: ForbiddenException → 403 Forbidden
    Note over API: Domain.Exceptions.ValidationException → 400 Bad Request
    Note over API: Microsoft.Data.SqlClient.SqlException → 503 Service Unavailable
    Note over API: All others → 500 Internal Server Error
```
