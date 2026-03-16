# Testing

This document describes the testing strategy and how to run tests for The Biergarten App.

## Overview

The project uses a multi-layered testing approach across backend and frontend:

- **API.Specs** - BDD integration tests using Reqnroll (Gherkin)
- **Infrastructure.Repository.Tests** - Unit tests for data access layer
- **Service.Auth.Tests** - Unit tests for authentication business logic
- **Storybook Vitest project** - Browser-based interaction tests for shared website stories
- **Storybook Playwright suite** - Browser checks against Storybook-rendered components

## Running Tests with Docker (Recommended)

The easiest way to run all tests is using Docker Compose, which sets up an isolated test
environment:

```bash
docker compose -f docker-compose.test.yaml up --abort-on-container-exit
```

This command:

1. Starts a fresh SQL Server instance
2. Runs database migrations
3. Seeds test data
4. Executes all test suites in parallel
5. Exports results to `./test-results/`
6. Exits when tests complete

### View Test Results

```bash
# List test result files
ls -la test-results/

# View specific test results
cat test-results/api-specs/results.trx
cat test-results/repository-tests/results.trx
cat test-results/service-auth-tests/results.trx
```

### Clean Up

```bash
# Remove test containers and volumes
docker compose -f docker-compose.test.yaml down -v
```

## Running Tests Locally

You can run individual test projects locally without Docker:

### Integration Tests (API.Specs)

```bash
cd src/Core
dotnet test API/API.Specs/API.Specs.csproj
```

**Requirements**:

- SQL Server instance running
- Database migrated and seeded
- Environment variables set (DB connection, JWT secret)

### Repository Tests

```bash
cd src/Core
dotnet test Infrastructure/Infrastructure.Repository.Tests/Infrastructure.Repository.Tests.csproj
```

**Requirements**:

- SQL Server instance running (uses mock data)

### Service Tests

```bash
cd src/Core
dotnet test Service/Service.Auth.Tests/Service.Auth.Tests.csproj
```

**Requirements**:

- No database required (uses Moq for mocking)

### Frontend Storybook Tests

```bash
cd src/Website
npm install
npm run test:storybook
```

**Purpose**:

- Verifies shared stories such as form fields, submit buttons, navbar states, toasts, and the theme gallery
- Runs in browser mode via Vitest and Storybook integration

### Frontend Playwright Storybook Tests

```bash
cd src/Website
npm install
npm run test:storybook:playwright
```

**Requirements**:

- Storybook dependencies installed
- Playwright browser dependencies installed
- The command will start or reuse the Storybook server defined in `playwright.storybook.config.ts`

## Test Coverage

### Current Coverage

**Authentication & User Management**:

- User registration with validation
- User login with JWT token generation
- Password hashing and verification (Argon2id)
- JWT token generation and claims
- Invalid credentials handling
- 404 error responses

**Repository Layer**:

- User account creation
- User credential management
- GetUserByUsername queries
- Stored procedure execution

**Service Layer**:

- Login service with password verification
- Register service with validation
- Business logic for authentication flow

**Frontend UI Coverage**:

- Shared submit button states
- Form field happy path and error presentation
- Navbar guest, authenticated, and mobile behavior
- Theme gallery rendering across Biergarten themes
- Toast interactions and themed notification display

### Planned Coverage

- [ ] Email verification workflow
- [ ] Password reset functionality
- [ ] Token refresh mechanism
- [ ] Brewery data management
- [ ] Beer post operations
- [ ] User follow/unfollow
- [ ] Image upload service
- [ ] Frontend route integration coverage beyond Storybook stories

## Testing Frameworks & Tools

### xUnit

- Primary unit testing framework
- Used for Repository and Service layer tests
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

### DbMocker

- Database mocking for repository tests
- Simulates SQL Server responses
- No real database required for unit tests

## Test Structure

### API.Specs (Integration Tests)

```
API.Specs/
├── Features/
│   ├── Authentication.feature          # Login/register scenarios
│   └── UserManagement.feature          # User CRUD scenarios
├── Steps/
│   ├── AuthenticationSteps.cs          # Step definitions
│   └── UserManagementSteps.cs
└── Mocks/
    └── TestApiFactory.cs               # Test server setup
```

**Example Feature**:

```gherkin
Feature: User Authentication
  As a user
  I want to register and login
  So that I can access the platform

Scenario: Successful user registration
  Given I have valid registration details
  When I register a new account
  Then I should receive a JWT token
  And my account should be created
```

### Infrastructure.Repository.Tests

```
Infrastructure.Repository.Tests/
├── AuthRepositoryTests.cs              # Auth repository tests
├── UserAccountRepositoryTests.cs       # User account tests
└── TestFixtures/
    └── DatabaseFixture.cs              # Shared test setup
```

### Service.Auth.Tests

```
Service.Auth.Tests/
├── LoginService.test.cs                # Login business logic tests
└── RegisterService.test.cs             # Registration business logic tests
```

## Writing Tests

### Unit Test Example (xUnit)

```csharp
public class LoginServiceTests
{
    [Fact]
    public async Task LoginAsync_ValidCredentials_ReturnsToken()
    {
        // Arrange
        var mockRepo = new Mock<IAuthRepository>();
        var mockJwt = new Mock<IJwtService>();
        var service = new AuthService(mockRepo.Object, mockJwt.Object);

        // Act
        var result = await service.LoginAsync("testuser", "password123");

        // Assert
        result.Should().NotBeNull();
        result.Token.Should().NotBeNullOrEmpty();
    }
}
```

### Integration Test Example (Reqnroll)

```gherkin
Scenario: User login with valid credentials
  Given a registered user with username "testuser"
  When I POST to "/api/auth/login" with valid credentials
  Then the response status should be 200
  And the response should contain a JWT token
```

## Continuous Integration

Tests run automatically in CI/CD pipelines using the test Docker Compose configuration:

```bash
# CI/CD command
docker compose -f docker-compose.test.yaml build
docker compose -f docker-compose.test.yaml up --abort-on-container-exit
docker compose -f docker-compose.test.yaml down -v
```

Exit codes:

- `0` - All tests passed
- Non-zero - Test failures occurred

Frontend UI checks should also be included in CI for the active website workspace:

```bash
cd src/Website
npm ci
npm run test:storybook
npm run test:storybook:playwright
```

## Troubleshooting

### Tests Failing Due to Database Connection

Ensure SQL Server is running and environment variables are set:

```bash
docker compose -f docker-compose.test.yaml ps
```

### Port Conflicts

If port 1433 is in use, stop other SQL Server instances or modify the port in
`docker-compose.test.yaml`.

### Stale Test Data

Clean up test database:

```bash
docker compose -f docker-compose.test.yaml down -v
```

### View Container Logs

```bash
docker compose -f docker-compose.test.yaml logs <service-name>
```

## Best Practices

1. **Isolation**: Each test should be independent and not rely on other tests
2. **Cleanup**: Use fixtures and dispose patterns for resource cleanup
3. **Mocking**: Mock external dependencies in unit tests
4. **Descriptive Names**: Use clear, descriptive test method names
5. **Arrange-Act-Assert**: Follow AAA pattern in unit tests
6. **Given-When-Then**: Follow GWT pattern in BDD scenarios
