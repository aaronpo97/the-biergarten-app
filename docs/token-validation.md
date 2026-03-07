# Token Validation Architecture

## Overview

The Core project implements comprehensive JWT token validation across three token types:

- **Access Tokens**: Short-lived (1 hour) tokens for API authentication
- **Refresh Tokens**: Long-lived (21 days) tokens for obtaining new access tokens
- **Confirmation Tokens**: Short-lived (30 minutes) tokens for email confirmation

## Components

### Infrastructure Layer

#### [ITokenInfrastructure](Infrastructure.Jwt/ITokenInfrastructure.cs)

Low-level JWT operations.

**Methods:**
- `GenerateJwt()` - Creates signed JWT tokens
- `ValidateJwtAsync()` - Validates token signature, expiration, and format

**Implementation:** [JwtInfrastructure.cs](Infrastructure.Jwt/JwtInfrastructure.cs)
- Uses Microsoft.IdentityModel.JsonWebTokens.JsonWebTokenHandler
- Algorithm: HS256 (HMAC-SHA256)
- Validates token lifetime, signature, and well-formedness

### Service Layer

#### [ITokenValidationService](Service.Auth/ITokenValidationService.cs)

High-level token validation with context (token type, user extraction).

**Methods:**
- `ValidateAccessTokenAsync(string token)` - Validates access tokens
- `ValidateRefreshTokenAsync(string token)` - Validates refresh tokens
- `ValidateConfirmationTokenAsync(string token)` - Validates confirmation tokens

**Returns:** `ValidatedToken` record containing:
- `UserId` (Guid)
- `Username` (string)
- `Principal` (ClaimsPrincipal) - Full JWT claims

**Implementation:** [TokenValidationService.cs](Service.Auth/TokenValidationService.cs)
- Reads token secrets from environment variables
- Extracts and validates claims (Sub, UniqueName)
- Throws `UnauthorizedException` on validation failure

#### [ITokenService](Service.Auth/ITokenService.cs)

Token generation (existing service extended).

**Methods:**
- `GenerateAccessToken(UserAccount)` - Creates 1-hour access token
- `GenerateRefreshToken(UserAccount)` - Creates 21-day refresh token
- `GenerateConfirmationToken(UserAccount)` - Creates 30-minute confirmation token

### Integration Points

#### [ConfirmationService](Service.Auth/IConfirmationService.cs)

**Flow:**
1. Receives confirmation token from user
2. Calls `TokenValidationService.ValidateConfirmationTokenAsync()`
3. Extracts user ID from validated token
4. Calls `AuthRepository.ConfirmUserAccountAsync()` to update database
5. Returns confirmation result

#### [RefreshTokenService](Service.Auth/RefreshTokenService.cs)

**Flow:**
1. Receives refresh token from user
2. Calls `TokenValidationService.ValidateRefreshTokenAsync()`
3. Retrieves user account via `AuthRepository.GetUserByIdAsync()`
4. Issues new access and refresh tokens via `TokenService`
5. Returns new token pair

#### [AuthController](API.Core/Controllers/AuthController.cs)

**Endpoints:**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Authenticate user
- `POST /api/auth/confirm?token=...` - Confirm email
- `POST /api/auth/refresh` - Refresh access token

## Validation Security

### Token Secrets

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

### Validation Checks

Each token is validated for:

1. **Signature Verification** - Token must be signed with correct secret
2. **Expiration** - Token must not be expired (checked against current time)
3. **Claims Presence** - Required claims (Sub, UniqueName) must be present
4. **Claims Format** - UserId claim must be a valid GUID

### Error Handling

Validation failures return HTTP 401 Unauthorized:
- Invalid signature → "Invalid token"
- Expired token → "Invalid token" (message doesn't reveal reason for security)
- Missing claims → "Invalid token"
- Malformed claims → "Invalid token"

## Token Lifecycle

### Access Token Lifecycle

1. **Generation**: During login (1-hour validity)
2. **Usage**: Included in Authorization header on API requests
3. **Validation**: Validated on protected endpoints
4. **Expiration**: Token becomes invalid after 1 hour
5. **Refresh**: Use refresh token to obtain new access token

### Refresh Token Lifecycle

1. **Generation**: During login (21-day validity)
2. **Storage**: Client-side (secure storage)
3. **Usage**: Posted to `/api/auth/refresh` endpoint
4. **Validation**: Validated by RefreshTokenService
5. **Rotation**: New refresh token issued on successful refresh
6. **Expiration**: Token becomes invalid after 21 days

### Confirmation Token Lifecycle

1. **Generation**: During user registration (30-minute validity)
2. **Delivery**: Emailed to user in confirmation link
3. **Usage**: User clicks link, token posted to `/api/auth/confirm`
4. **Validation**: Validated by ConfirmationService
5. **Completion**: User account marked as confirmed
6. **Expiration**: Token becomes invalid after 30 minutes

## Testing

### Unit Tests

**TokenValidationService.test.cs**
- Happy path: Valid token extraction
- Error cases: Invalid, expired, malformed tokens
- Missing/invalid claims scenarios

**RefreshTokenService.test.cs**
- Successful refresh with valid token
- Invalid/expired refresh token rejection
- Non-existent user handling

**ConfirmationService.test.cs**
- Successful confirmation with valid token
- Token validation failures
- User not found scenarios

### BDD Tests (Reqnroll)

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

## Future Enhancements

### Stretch Goals

1. **Middleware for Access Token Validation**
   - Automatically validate access tokens on protected routes
   - Populate HttpContext.User from token claims
   - Return 401 for invalid/missing tokens

2. **Token Blacklisting**
   - Implement token revocation (e.g., on logout)
   - Store blacklisted tokens in cache/database
   - Check blacklist during validation

3. **Refresh Token Rotation Strategy**
   - Detect token reuse (replay attacks)
   - Automatically invalidate entire token chain on reuse
   - Log suspicious activity

4. **Structured Logging**
   - Log token validation attempts
   - Track failed validation reasons
   - Alert on repeated validation failures (brute force detection)
