---
title: JWT token validation architecture
last-updated: 2026-08-31
tags:
  - jwt
  - authentication
  - security
  - tokens
---

## Overview

The Biergarten API validates JSON Web Tokens (JWTs) across three token types:

| Token Type              | Lifetime   | Purpose                     |
| ----------------------- | ---------- | --------------------------- |
| **Access Tokens**       | 1 hour     | API authentication          |
| **Refresh Tokens**      | 21 days    | Obtaining new access tokens |
| **Confirmation Tokens** | 30 minutes | Email confirmation          |

## Components

### Infrastructure layer

#### [ITokenInfrastructure](../../web/backend/Infrastructure/Infrastructure.Jwt/ITokenInfrastructure.cs)

Low-level JWT operations.

**Methods:**

- `GenerateJwt()` - Creates signed JWT tokens
- `ValidateJwtAsync()` - Validates token signature, expiration, and format

**Implementation:**
[JwtInfrastructure.cs](../../web/backend/Infrastructure/Infrastructure.Jwt/JwtInfrastructure.cs)

- Uses Microsoft.IdentityModel.JsonWebTokens.JsonWebTokenHandler
- Algorithm: HS256 (HMAC-SHA256)
- Validates token lifetime, signature, and well-formedness

### Features.Users slice

#### [ITokenService](../../web/backend/Features/Features.Users/Services/ITokenService.cs)

Token generation and validation live on the same slice-internal service.

**Generation methods:**

- `GenerateAccessToken(Guid userId, string username)` - Creates 1-hour access
  token
- `GenerateRefreshToken(Guid userId, string username)` - Creates 21-day refresh
  token
- `GenerateConfirmationToken(Guid userId, string username)` - Creates 30-minute
  confirmation token

**Validation methods:**

- `ValidateRefreshTokenAsync(string token)` - Validates refresh tokens
- `ValidateConfirmationTokenAsync(string token)` - Validates confirmation tokens

There is no `ValidateAccessTokenAsync` on `ITokenService`. Access-token
validation doesn't go through `ITokenService` at all: `JwtAuthenticationHandler`
(the host-level auth middleware) calls `ITokenInfrastructure.ValidateJwtAsync()`
directly, bypassing the `Features.Users` slice entirely.

**Returns (validation):** `ValidatedToken` record containing:

- `UserId` (Guid)
- `Username` (string)
- `Principal` (ClaimsPrincipal) - Full JWT claims

**Implementation:**
[TokenService.cs](../../web/backend/Features/Features.Users/Services/TokenService.cs)

- Reads token secrets from environment variables
- Extracts and validates claims (Sub, UniqueName)
- Throws `UnauthorizedException` on validation failure

`TokenService` is registered by `Features.Users`' own `AddFeaturesUsers()`
extension method, except for the lower-level `ITokenInfrastructure` (JWT
signing/verification) it depends on, which is registered by the host
(`API.Core/ServiceCollectionExtensions.cs`, via `AddCoreInfrastructure()`,
called from `Program.cs`) since `JwtAuthenticationHandler` (host-level auth
middleware) also depends on it directly.

### Integration points

#### [ConfirmUserHandler](../../web/backend/Features/Features.Users/Commands/Authentication/ConfirmUser/ConfirmUserHandler.cs)

**Flow:**

1. Receives confirmation token from user via `ConfirmUserCommand`
2. Calls `ITokenService.ValidateConfirmationTokenAsync()`
3. Extracts user ID from validated token and looks it up via
   `UserManager<ApplicationUser>`
4. Marks the account confirmed via
   `IUserEmailStore<ApplicationUser>.SetEmailConfirmedAsync()`, then persists it
   via `UserManager<ApplicationUser>.UpdateAsync()`
5. Returns confirmation result

`UserManager<ApplicationUser>` and `IUserEmailStore<ApplicationUser>` are
ASP.NET Core Identity's abstractions, not EF Core's default Identity store: the
app backs them with its own `DapperUserStore` (see
[Database](database.md#database-error-handling)), which persists against the
existing `UserAccount`/`UserCredential`/`UserVerification` tables via Dapper,
consistent with the rest of the app's repository pattern.

#### [ResendConfirmationEmailHandler](../../web/backend/Features/Features.Users/Commands/Authentication/ResendConfirmationEmail/ResendConfirmationEmailHandler.cs)

**Flow:**

1. Receives a user ID via `ResendConfirmationEmailCommand`
2. Looks up the user and checks they aren't already verified
3. Generates a fresh confirmation token via `ITokenService`
4. Sends `SendResendConfirmationEmailCommand` over MediatR, handled by the
   `Features.Emails` slice, with no direct project reference between the two
   slices

#### [RefreshTokenHandler](../../web/backend/Features/Features.Users/Commands/Authentication/RefreshToken/RefreshTokenHandler.cs)

**Flow:**

1. Receives a refresh token via `RefreshTokenCommand`
2. Delegates to `ITokenService.RefreshTokenAsync()`, which validates the token,
   retrieves the user account, and issues a new access/refresh token pair
3. Maps the result onto `LoginPayload`

#### [AuthController](../../web/backend/Features/Features.Users/Controllers/AuthController.cs)

**Endpoints:**

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Authenticate user
- `POST /api/auth/confirm?token=...` - Confirm email
- `POST /api/auth/confirm/resend?userId=...` - Resend the confirmation email
- `POST /api/auth/refresh` - Refresh access token

Account management (require a valid access token; user ID comes from the token,
never the request body):

- `PATCH /api/auth/username` - Change the authenticated user's username
- `PATCH /api/auth/email` - Change the authenticated user's email address;
  resets `EmailConfirmed` to false, so the user must re-confirm via
  `POST /api/auth/confirm/resend`
- `PATCH /api/auth/password` - Change the authenticated user's password;
  requires the current password
- `PATCH /api/auth/profile` - Update the authenticated user's profile (first
  name, last name, date of birth)
- `DELETE /api/auth/account` - Permanently delete the authenticated user's
  account; blocked while the account still has associated posts, comments,
  photos, or follows

## Validation security

### Token secrets

Three independent secrets enable:

- **Key rotation** - Rotate each secret type independently
- **Isolation** - Compromise of one secret doesn't affect others
- **Different expiration** - Different token types can expire at different rates

**Environment Variables:**

```bash
ACCESS_TOKEN_SECRET=...           # Signs 1-hour access tokens
REFRESH_TOKEN_SECRET=...          # Signs 21-day refresh tokens
CONFIRMATION_TOKEN_SECRET=...     # Signs 30-minute confirmation tokens
```

### Validation checks

Each token is validated for:

1. **Signature Verification** - Token must be signed with correct secret
2. **Expiration** - Token must not be expired (checked against current time)
3. **Claims Presence** - Required claims (Sub, UniqueName) must be present
4. **Claims Format** - UserId claim must be a valid GUID

### Error handling

Validation failures return HTTP 401 Unauthorized. Regardless of the specific
cause (invalid signature, expired token, missing header, malformed claims),
`JwtAuthenticationHandler.HandleChallengeAsync` always returns the same generic
message: `"Unauthorized: Invalid or missing authentication token"` — it doesn't
distinguish failure reasons in the response.

## Token lifecycle

### Access token lifecycle

| Step       | Description                                      |
| ---------- | ------------------------------------------------ |
| Generation | During login (1-hour validity)                   |
| Usage      | Included in Authorization header on API requests |
| Validation | Validated on protected endpoints                 |
| Expiration | Token becomes invalid after 1 hour               |
| Refresh    | Use refresh token to obtain new access token     |

### Refresh token lifecycle

| Step       | Description                                      |
| ---------- | ------------------------------------------------ |
| Generation | During login (21-day validity)                   |
| Storage    | Client-side (secure storage)                     |
| Usage      | Posted to `/api/auth/refresh` endpoint           |
| Validation | Validated by `ITokenService.RefreshTokenAsync()` |
| Rotation   | New refresh token issued on successful refresh   |
| Expiration | Token becomes invalid after 21 days              |

### Confirmation token lifecycle

| Step       | Description                                           |
| ---------- | ----------------------------------------------------- |
| Generation | During user registration (30-minute validity)         |
| Delivery   | Emailed to user in confirmation link                  |
| Usage      | User clicks link, token posted to `/api/auth/confirm` |
| Validation | Validated by `ConfirmUserHandler`                     |
| Completion | User account marked as confirmed                      |
| Expiration | Token becomes invalid after 30 minutes                |

## Testing

All of the following live in `Features.Users.Tests`.

### Unit tests

**Services/TokenServiceValidationTests.cs**

- Happy path: Valid token extraction
- Error cases: Invalid, expired, malformed tokens
- Missing/invalid claims scenarios

**Services/TokenServiceRefreshTests.cs**

- Successful refresh with valid token
- Invalid/expired refresh token rejection
- Non-existent user handling

**Commands/RefreshTokenHandlerTests.cs**

- Verifies the handler maps `ITokenService.RefreshTokenAsync()`'s result onto
  `LoginPayload`

**Commands/ConfirmUserHandlerTests.cs**

- Successful confirmation with valid token
- Token validation failures
- User not found scenarios

**Commands/ResendConfirmationEmailHandlerTests.cs**

- Sends a fresh confirmation email when the user exists and is unverified
- No-ops when the user doesn't exist or is already verified

### BDD tests (Reqnroll)

**TokenRefresh.feature**

- Successful token refresh
- Invalid/expired token rejection
- Missing token validation

**Confirmation.feature**

- Successful email confirmation
- Expired/tampered token rejection
- Missing token validation

**AccessTokenValidation.feature**

- Protected endpoint access token validation
- Invalid/expired access token rejection
- Token type mismatch (refresh used as access token)

## Future enhancements

### Stretch goals

1. **Middleware for Access Token Validation** - Automatically validate access
   tokens on protected routes - Populate HttpContext.User from token claims -
   Return 401 for invalid/missing tokens

2. **Token Denylisting** - Implement token revocation (for example, on logout) -
   Store denylisted tokens in cache/database - Check the denylist during
   validation

3. **Refresh Token Rotation Strategy** - Detect token reuse (replay attacks) -
   Automatically invalidate entire token chain on reuse - Log suspicious
   activity

4. **Structured Logging** - Log token validation attempts - Track failed
   validation reasons - Alert on repeated validation failures (brute force
   detection)
