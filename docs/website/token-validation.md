# Token validation architecture

## Overview

The Core project validates JSON Web Tokens (JWTs) across three token types:

- **Access Tokens**: Short-lived (1 hour) tokens for API authentication
- **Refresh Tokens**: Long-lived (21 days) tokens for obtaining new access
  tokens
- **Confirmation Tokens**: Short-lived (30 minutes) tokens for email
  confirmation

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

### Features.Auth slice

#### [ITokenService](../../web/backend/Features/Features.Auth/Services/ITokenService.cs)

Both token generation and validation live on the same slice-internal
service (there is no separate validation service/class).

**Generation methods:**

- `GenerateAccessToken(UserAccount)` - Creates 1-hour access token
- `GenerateRefreshToken(UserAccount)` - Creates 21-day refresh token
- `GenerateConfirmationToken(UserAccount)` - Creates 30-minute confirmation
  token

**Validation methods:**

- `ValidateAccessTokenAsync(string token)` - Validates access tokens
- `ValidateRefreshTokenAsync(string token)` - Validates refresh tokens
- `ValidateConfirmationTokenAsync(string token)` - Validates confirmation tokens

**Returns (validation):** `ValidatedToken` record containing:

- `UserId` (Guid)
- `Username` (string)
- `Principal` (ClaimsPrincipal) - Full JWT claims

**Implementation:** [TokenService.cs](../../web/backend/Features/Features.Auth/Services/TokenService.cs)

- Reads token secrets from environment variables
- Extracts and validates claims (Sub, UniqueName)
- Throws `UnauthorizedException` on validation failure

`TokenService` is registered by `Features.Auth`'s own
`AddFeaturesAuth()` extension method, except for the lower-level
`ITokenInfrastructure` (JWT signing/verification) it depends on, which is
registered by the host (`API.Core/Program.cs`) since
`JwtAuthenticationHandler` (host-level auth middleware) also depends on
it directly.

### Integration points

#### [ConfirmUserHandler](../../web/backend/Features/Features.Auth/Commands/ConfirmUser/ConfirmUserHandler.cs)

**Flow:**

1. Receives confirmation token from user via `ConfirmUserCommand`
2. Calls `ITokenService.ValidateConfirmationTokenAsync()`
3. Extracts user ID from validated token
4. Calls `IAuthRepository.ConfirmUserAccountAsync()` to update database
5. Returns confirmation result

#### [ResendConfirmationEmailHandler](../../web/backend/Features/Features.Auth/Commands/ResendConfirmationEmail/ResendConfirmationEmailHandler.cs)

**Flow:**

1. Receives a user ID via `ResendConfirmationEmailCommand`
2. Looks up the user and checks they aren't already verified
3. Generates a fresh confirmation token via `ITokenService`
4. Sends `SendResendConfirmationEmailCommand` over MediatR, handled by the
   `Features.Emails` slice, with no direct project reference between the two
   slices

#### [RefreshTokenHandler](../../web/backend/Features/Features.Auth/Commands/RefreshToken/RefreshTokenHandler.cs)

**Flow:**

1. Receives a refresh token via `RefreshTokenCommand`
2. Delegates to `ITokenService.RefreshTokenAsync()`, which validates the
   token, retrieves the user account via `IAuthRepository.GetUserByIdAsync()`,
   and issues a new access/refresh token pair
3. Maps the result onto `LoginPayload`

#### [AuthController](../../web/backend/Features/Features.Auth/Controllers/AuthController.cs)

**Endpoints:**

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Authenticate user
- `POST /api/auth/confirm?token=...` - Confirm email
- `POST /api/auth/confirm/resend?userId=...` - Resend the confirmation email
- `POST /api/auth/refresh` - Refresh access token

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

Validation failures return HTTP 401 Unauthorized:

- Invalid signature → "Invalid token"
- Expired token → "Invalid token" (message doesn't reveal reason for security)
- Missing claims → "Invalid token"
- Malformed claims → "Invalid token"

## Token lifecycle

### Access token lifecycle

1. **Generation**: During login (1-hour validity)
2. **Usage**: Included in Authorization header on API requests
3. **Validation**: Validated on protected endpoints
4. **Expiration**: Token becomes invalid after 1 hour
5. **Refresh**: Use refresh token to obtain new access token

### Refresh token lifecycle

1. **Generation**: During login (21-day validity)
2. **Storage**: Client-side (secure storage)
3. **Usage**: Posted to `/api/auth/refresh` endpoint
4. **Validation**: Validated by `ITokenService.RefreshTokenAsync()`
5. **Rotation**: New refresh token issued on successful refresh
6. **Expiration**: Token becomes invalid after 21 days

### Confirmation token lifecycle

1. **Generation**: During user registration (30-minute validity)
2. **Delivery**: Emailed to user in confirmation link
3. **Usage**: User clicks link, token posted to `/api/auth/confirm`
4. **Validation**: Validated by `ConfirmUserHandler`
5. **Completion**: User account marked as confirmed
6. **Expiration**: Token becomes invalid after 30 minutes

## Testing

All of the following live in `Features.Auth.Tests`.

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

1. **Middleware for Access Token Validation**
   - Automatically validate access tokens on protected routes
   - Populate HttpContext.User from token claims
   - Return 401 for invalid/missing tokens

2. **Token Denylisting**
   - Implement token revocation (for example, on logout)
   - Store denylisted tokens in cache/database
   - Check the denylist during validation

3. **Refresh Token Rotation Strategy**
   - Detect token reuse (replay attacks)
   - Automatically invalidate entire token chain on reuse
   - Log suspicious activity

4. **Structured Logging**
   - Log token validation attempts
   - Track failed validation reasons
   - Alert on repeated validation failures (brute force detection)
