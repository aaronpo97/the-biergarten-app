
# Testing

This document describes the testing strategy and how to run tests for The
Biergarten App.

## Overview

The project uses a multi-layered testing approach across backend and frontend:

- **API.Specs** - BDD integration tests using Reqnroll (Gherkin), run against a
  live, seeded database
- **Features.\*.Tests** - One unit test project per backend feature slice
  (`Features.Auth.Tests`, `Features.Breweries.Tests`,
  `Features.UserManagement.Tests`, `Features.Emails.Tests`), covering that
  slice's command/query handlers, with dependencies mocked via Moq (no real
  database required)
- **Storybook Vitest project** - Browser-based interaction tests for shared
  website stories
- **Storybook Playwright suite** - Browser checks against Storybook-rendered
  components

## Running tests with Docker (recommended)

The easiest way to run all tests is using Docker Compose, which sets up an
isolated test environment:

```bash
docker compose --env-file web/.env.test -f web/docker-compose.test.yaml up --abort-on-container-exit
```

This command:

1. Starts a fresh SQL Server instance
2. Runs database migrations
3. Seeds test data
4. Executes all test suites in parallel
5. Exports results to `./test-results/`
6. Exits when tests complete

### View test results

```bash
# List test result files
ls -la test-results/

# View specific test results
cat test-results/api-specs/results.trx
cat test-results/Features.Auth.Tests.trx
cat test-results/Features.Breweries.Tests.trx
cat test-results/Features.UserManagement.Tests.trx
cat test-results/Features.Emails.Tests.trx
```

### Clean up

```bash
# Remove test containers and volumes
docker compose --env-file web/.env.test -f web/docker-compose.test.yaml down -v
```

## Running tests locally

You can run individual test projects locally without Docker:

### Integration tests (API.Specs)

```bash
cd web/backend
dotnet test API/API.Specs/API.Specs.csproj
```

**Requirements**:

- SQL Server instance running
- Database migrated and seeded
- Environment variables set (DB connection, JWT secret)

### Feature slice unit tests

Each feature slice has its own test project, covering its command/query
handlers:

```bash
cd web/backend
dotnet test Features/Features.Auth.Tests/Features.Auth.Tests.csproj
dotnet test Features/Features.Breweries.Tests/Features.Breweries.Tests.csproj
dotnet test Features/Features.UserManagement.Tests/Features.UserManagement.Tests.csproj
dotnet test Features/Features.Emails.Tests/Features.Emails.Tests.csproj

# Or run all of them at once via the solution:
for proj in Features/*.Tests; do dotnet test "$proj"; done
```

**Requirements**:

- No database required (handlers are tested with their repository/service
  dependencies mocked via Moq)

### Frontend Storybook tests

```bash
cd web/frontend
npm install
npm run test:storybook
```

**Purpose**:

- Verifies shared stories such as form fields, submit buttons, navbar states,
  toasts, and the theme gallery
- Runs in browser mode via Vitest and Storybook integration

### Frontend Playwright Storybook tests

```bash
cd web/frontend
npm install
npm run test:storybook:playwright
```

**Requirements**:

- Storybook dependencies installed
- Playwright browser dependencies installed
- The command will start or reuse the Storybook server defined in
  `playwright.storybook.config.ts`

### Running Storybook tests with a visible browser

Both of the above run headless by default. To watch the browser while
debugging a failure:

```bash
# Playwright Storybook suite
npx playwright test -c playwright.storybook.config.ts --headed
# or the interactive step-through runner
npx playwright test -c playwright.storybook.config.ts --ui

# Vitest/story play-function suite
npx vitest run --project storybook --browser.headless=false
# or Vitest's own UI (drop `run` for watch mode)
npx vitest --project storybook --browser.headless=false --ui
```

The default (`headless: true`) is set in `web/frontend/vite.config.ts`.

## Test coverage

### Current coverage

**Features.Auth.Tests**:

- User registration with validation
- User login with JWT token generation
- Password hashing and verification (Argon2id)
- Email confirmation and confirmation-email resend
- Refresh token exchange
- JWT token generation, validation, and claims handling
- Invalid credentials and 404 error responses (via API.Specs)

**Features.Breweries.Tests**:

- Brewery create/update/delete commands and get-by-id/get-all queries

**Features.UserManagement.Tests**:

- User get-by-id/get-all queries and the (currently unrouted) update command

**Features.Emails.Tests**:

- Registration and resend-confirmation email dispatch handlers

**Frontend UI Coverage**:

- Shared submit button states
- Form field happy path and error presentation
- Navbar guest, authenticated, and mobile behavior
- Theme gallery rendering across Biergarten themes
- Toast interactions and themed notification display

### Planned coverage

- [ ] Password reset functionality
- [ ] Beer post operations
- [ ] User follow/unfollow
- [ ] Image upload service
- [ ] Frontend route integration coverage beyond Storybook stories

## Testing frameworks and tools

### xUnit

- Primary unit testing framework
- Used for handler and service layer tests
- Supports parallel test execution

### Reqnroll (Gherkin/BDD)

- Behavior-driven development framework
- Used for API integration tests
- Human-readable test scenarios in `.feature` files

### FluentAssertions

- Expressive assertion library
- Makes test assertions more readable
- Used across all test projects

### Moq

- Mocking framework for .NET
- Used in Service layer tests
- Enables isolated unit testing

## Test structure

### API.Specs (integration tests)

```
API.Specs/
├── Features/
│   ├── Registration.feature            # Registration scenarios
│   ├── Login.feature                   # Login scenarios
│   ├── Confirmation.feature            # Email confirmation scenarios
│   ├── ResendConfirmation.feature      # Resend-confirmation scenarios
│   ├── TokenRefresh.feature            # Refresh token scenarios
│   ├── AccessTokenValidation.feature   # Protected endpoint access scenarios
│   └── NotFound.feature                # 404 handling
├── Steps/
│   ├── AuthSteps.cs                    # Step definitions for the Auth features
│   └── ApiGeneralSteps.cs              # Shared/general step definitions
├── Mocks/
│   ├── MockEmailDispatcher.cs          # Substitutes Features.Emails' IEmailDispatcher
│   └── MockEmailProvider.cs            # Substitutes Infrastructure.Email's IEmailProvider
└── TestApiFactory.cs                   # Test server setup (swaps in the mocks above)
```

**Example Feature**:

```gherkin
Feature: User Registration
  As a user
  I want to register
  So that I can access the platform

Scenario: Successful user registration
  Given I have valid registration details
  When I register a new account
  Then I should receive a JWT token
  And my account should be created
```

### Features.Auth.Tests

```
Features.Auth.Tests/
├── Commands/
│   ├── RegisterUserHandlerTests.cs
│   ├── ConfirmUserHandlerTests.cs
│   ├── ResendConfirmationEmailHandlerTests.cs
│   └── RefreshTokenHandlerTests.cs
├── Queries/
│   └── LoginHandlerTests.cs            # tests LoginCommand, despite the folder name
└── Services/
    ├── TokenServiceRefreshTests.cs
    └── TokenServiceValidationTests.cs
```

Each of the other three slices (`Features.Breweries.Tests`,
`Features.UserManagement.Tests`, `Features.Emails.Tests`) follows the same
shape: a `Commands/`/`Queries/` folder with one test file per handler.

## Writing tests

### Unit test example (xUnit)

```csharp
public class LoginHandlerTests
{
    [Fact]
    public async Task Handle_WithValidData_ReturnsPayloadWithMatchingUsername()
    {
        // Arrange
        var authRepoMock = new Mock<IAuthRepository>();
        var passwordInfraMock = new Mock<IPasswordInfrastructure>();
        var tokenServiceMock = new Mock<ITokenService>();
        var handler = new LoginHandler(authRepoMock.Object, passwordInfraMock.Object, tokenServiceMock.Object);
        // ...set up mocks for a known user/credential...

        // Act
        var result = await handler.Handle(new LoginCommand("testuser", "password123"), CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.AccessToken.Should().NotBeNullOrEmpty();
    }
}
```

### Integration test example (Reqnroll)

```gherkin
Scenario: User login with valid credentials
  Given a registered user with username "testuser"
  When I POST to "/api/auth/login" with valid credentials
  Then the response status should be 200
  And the response should contain a JWT token
```

## Continuous integration

Tests run automatically in CI/CD pipelines using the test Docker Compose
configuration:

```bash
# CI/CD command
docker compose --env-file web/.env.test -f web/docker-compose.test.yaml build
docker compose --env-file web/.env.test -f web/docker-compose.test.yaml up --abort-on-container-exit
docker compose --env-file web/.env.test -f web/docker-compose.test.yaml down -v
```

Exit codes:

- `0` - All tests passed
- Non-zero - Test failures occurred

Frontend UI checks should also be included in CI for the active website
workspace:

```bash
cd web/frontend
npm ci
npm run test:storybook
npm run test:storybook:playwright
```

## Troubleshooting

### Tests failing due to database connection

Ensure SQL Server is running and environment variables are set:

```bash
docker compose --env-file web/.env.test -f web/docker-compose.test.yaml ps
```

### Port conflicts

If port 1433 is in use, stop other SQL Server instances or modify the port in
`docker-compose.test.yaml`.

### Stale test data

Clean up test database:

```bash
docker compose --env-file web/.env.test -f web/docker-compose.test.yaml down -v
```

### View container logs

```bash
docker compose --env-file web/.env.test -f web/docker-compose.test.yaml logs <service-name>
```

## Best practices

1. **Isolation**: Each test should be independent and not rely on other tests
2. **Cleanup**: Use fixtures and dispose patterns for resource cleanup
3. **Mocking**: Mock external dependencies in unit tests
4. **Descriptive Names**: Use clear, descriptive test method names
5. **Arrange-Act-Assert**: Follow AAA pattern in unit tests
6. **Given-When-Then**: Follow GWT pattern in BDD scenarios
