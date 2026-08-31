---
title: Testing strategy — unit, integration, and Storybook suites
last-updated: 2026-08-31
tags:
  - testing
  - ci
  - xunit
  - reqnroll
  - storybook
---

This document describes the testing strategy and how to run tests for The
Biergarten App.

## Overview

The project uses a multi-layered testing approach across backend and frontend:

- **API.Specs** - BDD integration tests using Reqnroll (Gherkin), run against a
  live, seeded database
- **Features.\*.Tests** - One unit test project per backend feature slice
  (`Features.Users.Tests`, `Features.Breweries.Tests`, `Features.Emails.Tests`,
  `Features.PhotoUpload.Tests`), covering that slice's command/query handlers,
  with dependencies mocked via Moq (no real database required)
- **Storybook Vitest project** - Browser-based interaction tests for shared
  website stories
- **Storybook Playwright suite** - Browser checks against Storybook-rendered
  components

## Running tests with Docker (recommended)

To run all tests, use Docker Compose, which sets up an isolated test
environment:

```bash
docker compose --env-file web/.env.test -f web/docker-compose.test.yaml up -d
docker compose --env-file web/.env.test -f web/docker-compose.test.yaml wait api.specs unit.tests frontend.tests
```

This command:

1. Starts a fresh SQL Server instance
2. Runs database migrations
3. Seeds test data
4. Executes all test suites in parallel, including the frontend's Storybook
   Vitest and Playwright suites (`frontend.tests`, which needs no database)
5. Exports results to `./test-results/`
6. Returns once all three test containers have exited

`wait` blocks until `api.specs`, `unit.tests`, and `frontend.tests` have all
stopped, regardless of which one finishes first. Long-running services
(`sqlserver`, `seaweedfs`) and the one-shot `database.migrations` /
`database.seed` jobs keep running in the background alongside them and are torn
down separately (see below); `wait` doesn't touch them.

### View test results

```bash
# List test result files
ls -la test-results/

# View specific test results
cat test-results/api-specs/results.trx
cat test-results/Features.Users.Tests.trx
cat test-results/Features.Breweries.Tests.trx
cat test-results/Features.Emails.Tests.trx
cat test-results/Features.PhotoUpload.Tests.trx
cat test-results/frontend/vitest-storybook.xml
cat test-results/frontend/playwright-storybook.xml
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
dotnet test Features/Features.Users.Tests/Features.Users.Tests.csproj
dotnet test Features/Features.Breweries.Tests/Features.Breweries.Tests.csproj
dotnet test Features/Features.Emails.Tests/Features.Emails.Tests.csproj
dotnet test Features/Features.PhotoUpload.Tests/Features.PhotoUpload.Tests.csproj

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

Both of the above run headless by default. To watch the browser while debugging
a failure:

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

**Features.Users.Tests**:

- User registration with validation
- User login with JWT token generation
- Password hashing and verification (Argon2id)
- Email confirmation and confirmation-email resend
- Refresh token exchange
- JWT token generation, validation, and claims handling
- Invalid credentials and 404 error responses (via API.Specs)
- Account management: username, email, password, and profile updates, and
  account deletion (blocked while dependent posts, comments, photos, or follows
  exist)
- User get-by-id/get-all queries

**Features.Breweries.Tests**:

- Brewery create/update/delete commands and get-by-id/get-all queries
- Brewery location queries: all locations, and locations within a given range of
  a coordinate

**Features.Emails.Tests**:

- Registration and resend-confirmation email dispatch handlers

**Features.PhotoUpload.Tests**:

- Upload command handler: storage key construction, content type passthrough,
  and photo persistence via the mocked storage provider and repository
- Upload validator: min/max file size bounds, and PNG/JPEG/WebP signature checks
  (including rejection of files with a mismatched or missing signature)

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

### Features.Users.Tests

```
Features.Users.Tests/
├── Commands/
│   ├── RegisterUserHandlerTests.cs
│   ├── ConfirmUserHandlerTests.cs
│   ├── ResendConfirmationEmailHandlerTests.cs
│   ├── RefreshTokenHandlerTests.cs
│   ├── UpdateUsernameHandlerTests.cs
│   ├── UpdateEmailHandlerTests.cs
│   ├── UpdatePasswordHandlerTests.cs
│   ├── UpdateProfileHandlerTests.cs
│   └── DeleteAccountHandlerTests.cs
├── Queries/
│   ├── LoginHandlerTests.cs            # tests LoginCommand, despite the folder name
│   ├── GetAllUsersHandlerTests.cs
│   └── GetUserByIdHandlerTests.cs
├── Services/
│   ├── TokenServiceRefreshTests.cs
│   └── TokenServiceValidationTests.cs
└── TestSupport/                        # shared test fixtures/helpers
```

Each of the other slices (`Features.Breweries.Tests`, `Features.Emails.Tests`,
`Features.PhotoUpload.Tests`) follows the same shape: a `Commands/`/`Queries/`
folder with one test file per handler (`Features.PhotoUpload.Tests` also adds a
validator test file alongside its handler test).

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

The `.github/workflows/tests.yml` GitHub Actions workflow runs on every push and
pull request to `main`. It runs the same test Docker Compose configuration used
locally, so backend and frontend tests execute in the same containerized
environment in CI as they do on a developer machine:

```bash
# CI/CD command
docker compose --env-file web/.env.test -f web/docker-compose.test.yaml build
docker compose --env-file web/.env.test -f web/docker-compose.test.yaml up -d
docker compose --env-file web/.env.test -f web/docker-compose.test.yaml wait api.specs unit.tests frontend.tests
docker compose --env-file web/.env.test -f web/docker-compose.test.yaml down -v
```

The workflow inspects the exit code of each test container
(`test-env-api-specs`, `test-env-unit-tests`, `test-env-frontend-tests`) after
`wait` returns and fails the job if any of them is non-zero. `./test-results/`
is uploaded as a build artifact regardless of outcome.

`up -d` + `wait` keeps container teardown independent of any single container's
exit. The one-shot `database.migrations`/`database.seed` jobs exit 0 partway
through the run, and `frontend.tests` (which has no database dependency)
reliably finishes before `api.specs`/`unit.tests` start; because `wait` blocks
on all three test containers, neither early exit ends the run prematurely.

Exit codes:

- `0` - All tests passed
- Non-zero - Test failures occurred

The frontend's Storybook Vitest and Playwright suites run inside the
`frontend.tests` container (see [Docker Guide](docker.md)) as part of that same
compose run, so no separate frontend CI step is needed. To run them locally
without Docker:

```bash
cd web/frontend
npm ci
npm run test:storybook
npm run test:storybook:playwright
```

### Running the workflow locally with `act`

[`act`](https://github.com/nektos/act) replays `.github/workflows/*.yml` on your
own machine using Docker, so you can reproduce a CI run (or a fix for one)
without pushing a branch.

**Install** (macOS):

```bash
brew install act
```

**Run the workflow** from the repo root:

```bash
act push \
  -j containerized-tests \
  -W .github/workflows/tests.yml \
  -P ubuntu-latest=catthehacker/ubuntu:act-latest \
  --container-architecture linux/amd64
```

- `-j containerized-tests` runs only that job (there's currently just the one).
- `-P ubuntu-latest=catthehacker/ubuntu:act-latest` pins the runner image act
  uses to impersonate `ubuntu-latest`. Without it, act's first run prompts
  interactively to choose a default image size, which hangs/fails under a
  non-interactive shell.
- `--container-architecture linux/amd64` is required on Apple Silicon: the
  `sqlserver` service's image is amd64-only, and act needs to know to emulate
  that platform for the whole job container, not just that one service.
- No secrets or `.actrc` are needed: `generate-env.sh` creates its own
  `.env.test` with freshly randomized values, same as in real CI.

**Known act-only limitation**: the "Upload test results" step
(`actions/upload-artifact@v4`) fails locally with
`Unable to get the ACTIONS_RUNTIME_TOKEN env variable`. act doesn't provide a
real Actions artifact backend, so this step, and only this step, is expected to
fail under act even when everything else passes. It works normally on
GitHub-hosted runners.

**Stale local state**: `docker-compose.test.yaml` uses fixed container names and
named volumes (`sqlserverdata-test`, `seaweedfsdata-test`) scoped to the `web`
compose project. If a previous local run (via `act` or a manual `docker compose`
invocation) didn't get torn down, its SQL Server volume can persist with an old
`SA_PASSWORD` baked in, while a fresh `.env.test` generates a new one each run,
causing `Login failed for user 'sa'` errors that look like a test bug but are
really a leftover volume. Clear it before re-running:

```bash
docker compose --env-file web/.env.test -f web/docker-compose.test.yaml down -v
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
