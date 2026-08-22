using System.Text;
using System.Text.Json;
using FluentAssertions;
using Infrastructure.Jwt;
using Reqnroll;

namespace API.Specs.Steps;

[Binding]
public class AuthSteps(ScenarioContext scenario)
{
    private const string ClientKey = "client";
    private const string FactoryKey = "factory";
    private const string ResponseKey = "response";
    private const string ResponseBodyKey = "responseBody";
    private const string TestUserKey = "testUser";
    private const string RegisteredUserIdKey = "registeredUserId";
    private const string RegisteredUsernameKey = "registeredUsername";
    private const string PreviousAccessTokenKey = "previousAccessToken";
    private const string PreviousRefreshTokenKey = "previousRefreshToken";

    private HttpClient GetClient()
    {
        if (scenario.TryGetValue<HttpClient>(ClientKey, out HttpClient? client))
            return client;

        TestApiFactory? factory = scenario.TryGetValue<TestApiFactory>(
            FactoryKey,
            out TestApiFactory? f
        )
            ? f
            : new TestApiFactory();
        scenario[FactoryKey] = factory;

        client = factory.CreateClient();
        scenario[ClientKey] = client;
        return client;
    }

    private static string GetRequiredEnvVar(string name)
    {
        return Environment.GetEnvironmentVariable(name)
            ?? throw new InvalidOperationException($"{name} environment variable is not set");
    }

    private static string GenerateJwtToken(
        Guid userId,
        string username,
        string secret,
        DateTime expiry
    )
    {
        JwtInfrastructure infra = new();
        return infra.GenerateJwt(userId, username, expiry, secret);
    }

    private static Guid ParseRegisteredUserId(JsonElement root)
    {
        return root.GetProperty("payload").GetProperty("userAccountId").GetGuid();
    }

    private static string ParseRegisteredUsername(JsonElement root)
    {
        return root.GetProperty("payload").GetProperty("username").GetString()
            ?? throw new InvalidOperationException("username missing from registration payload");
    }

    private static string ParseTokenFromPayload(
        JsonElement payload,
        string camelCaseName,
        string pascalCaseName
    )
    {
        if (
            payload.TryGetProperty(camelCaseName, out JsonElement tokenElem)
            || payload.TryGetProperty(pascalCaseName, out tokenElem)
        )
            return tokenElem.GetString()
                ?? throw new InvalidOperationException($"{camelCaseName} is null");

        throw new InvalidOperationException(
            $"Could not find token field '{camelCaseName}' in payload"
        );
    }

    private const string FixtureUsername = "test.user";
    private const string FixturePassword = "Password1!";
    private const string FixtureEmail = "test.user@thebiergarten.app";

    // Scenarios run in parallel across feature classes, and this fixture is shared by name.
    // Serializing provisioning avoids two scenarios racing to INSERT the same username/email,
    // which would otherwise surface as a raw SQL unique-constraint error instead of a clean 409.
    private static readonly SemaphoreSlim FixtureProvisioningLock = new(1, 1);

    [Given("I have an existing account")]
    public async Task GivenIHaveAnExistingAccount()
    {
        scenario[TestUserKey] = (FixtureUsername, FixturePassword);

        HttpClient client = GetClient();
        var registrationData = new
        {
            username = FixtureUsername,
            firstName = "Test",
            lastName = "User",
            email = FixtureEmail,
            dateOfBirth = "1990-01-01",
            password = FixturePassword,
        };

        HttpRequestMessage requestMessage = new(HttpMethod.Post, "/api/auth/register")
        {
            Content = new StringContent(
                JsonSerializer.Serialize(registrationData),
                Encoding.UTF8,
                "application/json"
            ),
        };

        // Registration is used (rather than relying on seeded data) so the fixture account is
        // guaranteed to exist regardless of run order. A 409 means another scenario in this run
        // already provisioned it, which is equally fine.
        await FixtureProvisioningLock.WaitAsync();
        HttpResponseMessage response;
        try
        {
            response = await client.SendAsync(requestMessage);
        }
        finally
        {
            FixtureProvisioningLock.Release();
        }

        if ((int)response.StatusCode is not (201 or 409))
            throw new InvalidOperationException(
                $"Failed to provision fixture account '{FixtureUsername}': "
                    + $"{(int)response.StatusCode} {response.StatusCode}"
            );
    }

    [Given("I do not have an existing account")]
    public void GivenIDoNotHaveAnExistingAccount()
    {
        scenario[TestUserKey] = ("Failing", "User");
    }

    [When("I submit a login request with a username and password")]
    public async Task WhenISubmitALoginRequestWithAUsernameAndPassword()
    {
        HttpClient client = GetClient();
        (string username, string password) = scenario.TryGetValue<(
            string username,
            string password
        )>(TestUserKey, out (string username, string password) user)
            ? user
            : ("test.user", "password");

        string body = JsonSerializer.Serialize(new { username, password });

        HttpRequestMessage requestMessage = new(HttpMethod.Post, "/api/auth/login")
        {
            Content = new StringContent(body, Encoding.UTF8, "application/json"),
        };

        HttpResponseMessage response = await client.SendAsync(requestMessage);
        string responseBody = await response.Content.ReadAsStringAsync();

        scenario[ResponseKey] = response;
        scenario[ResponseBodyKey] = responseBody;
    }

    [When("I submit a login request with a missing username")]
    public async Task WhenISubmitALoginRequestWithAMissingUsername()
    {
        HttpClient client = GetClient();
        string body = JsonSerializer.Serialize(new { password = "test" });

        HttpRequestMessage requestMessage = new(HttpMethod.Post, "/api/auth/login")
        {
            Content = new StringContent(body, Encoding.UTF8, "application/json"),
        };

        HttpResponseMessage response = await client.SendAsync(requestMessage);
        string responseBody = await response.Content.ReadAsStringAsync();

        scenario[ResponseKey] = response;
        scenario[ResponseBodyKey] = responseBody;
    }

    [When("I submit a login request with a missing password")]
    public async Task WhenISubmitALoginRequestWithAMissingPassword()
    {
        HttpClient client = GetClient();
        string body = JsonSerializer.Serialize(new { username = "test" });

        HttpRequestMessage requestMessage = new(HttpMethod.Post, "/api/auth/login")
        {
            Content = new StringContent(body, Encoding.UTF8, "application/json"),
        };

        HttpResponseMessage response = await client.SendAsync(requestMessage);
        string responseBody = await response.Content.ReadAsStringAsync();

        scenario[ResponseKey] = response;
        scenario[ResponseBodyKey] = responseBody;
    }

    [When("I submit a login request with both username and password missing")]
    public async Task WhenISubmitALoginRequestWithBothUsernameAndPasswordMissing()
    {
        HttpClient client = GetClient();
        HttpRequestMessage requestMessage = new(HttpMethod.Post, "/api/auth/login")
        {
            Content = new StringContent("{}", Encoding.UTF8, "application/json"),
        };

        HttpResponseMessage response = await client.SendAsync(requestMessage);
        string responseBody = await response.Content.ReadAsStringAsync();

        scenario[ResponseKey] = response;
        scenario[ResponseBodyKey] = responseBody;
    }

    [Then("the response JSON should have an access token")]
    public void ThenTheResponseJsonShouldHaveAnAccessToken()
    {
        scenario
            .TryGetValue<HttpResponseMessage>(ResponseKey, out HttpResponseMessage? response)
            .Should()
            .BeTrue();
        scenario.TryGetValue<string>(ResponseBodyKey, out string? responseBody).Should().BeTrue();

        JsonDocument doc = JsonDocument.Parse(responseBody!);
        JsonElement root = doc.RootElement;
        JsonElement tokenElem = default;
        bool hasToken = false;

        if (
            root.TryGetProperty("payload", out JsonElement payloadElem)
            && payloadElem.ValueKind == JsonValueKind.Object
        )
            hasToken =
                payloadElem.TryGetProperty("accessToken", out tokenElem)
                || payloadElem.TryGetProperty("AccessToken", out tokenElem);

        hasToken.Should().BeTrue("Expected an access token either at the root or inside 'payload'");

        string? token = tokenElem.GetString();
        token.Should().NotBeNullOrEmpty();
    }

    [When("I submit a login request using a GET request")]
    public async Task WhenISubmitALoginRequestUsingAgetRequest()
    {
        HttpClient client = GetClient();
        // testing GET
        HttpRequestMessage requestMessage = new(HttpMethod.Get, "/api/auth/login")
        {
            Content = new StringContent("{}", Encoding.UTF8, "application/json"),
        };

        HttpResponseMessage response = await client.SendAsync(requestMessage);
        string responseBody = await response.Content.ReadAsStringAsync();

        scenario[ResponseKey] = response;
        scenario[ResponseBodyKey] = responseBody;
    }

    [When("I submit a registration request with values:")]
    public async Task WhenISubmitARegistrationRequestWithValues(Table table)
    {
        HttpClient client = GetClient();
        DataTableRow? row = table.Rows[0];

        string username = row["Username"] ?? "";
        string firstName = row["FirstName"] ?? "";
        string lastName = row["LastName"] ?? "";
        string email = row["Email"] ?? "";
        string dateOfBirth = row["DateOfBirth"] ?? "";

        if (dateOfBirth == "{underage_date}")
            dateOfBirth = DateTime.UtcNow.AddYears(-18).ToString("yyyy-MM-dd");

        // Keep default registration fixture values unique across repeated runs.
        if (email == "newuser@example.com")
        {
            string suffix = Guid.NewGuid().ToString("N")[..8];
            email = $"newuser-{suffix}@example.com";

            if (username == "newuser")
                username = $"newuser-{suffix}";
        }

        string? password = row["Password"];

        var registrationData = new
        {
            username,
            firstName,
            lastName,
            email,
            dateOfBirth,
            password,
        };

        string body = JsonSerializer.Serialize(registrationData);

        HttpRequestMessage requestMessage = new(HttpMethod.Post, "/api/auth/register")
        {
            Content = new StringContent(body, Encoding.UTF8, "application/json"),
        };

        HttpResponseMessage response = await client.SendAsync(requestMessage);
        string responseBody = await response.Content.ReadAsStringAsync();

        scenario[ResponseKey] = response;
        scenario[ResponseBodyKey] = responseBody;
    }

    [When("I submit a registration request using a GET request")]
    public async Task WhenISubmitARegistrationRequestUsingAGetRequest()
    {
        HttpClient client = GetClient();
        HttpRequestMessage requestMessage = new(HttpMethod.Get, "/api/auth/register")
        {
            Content = new StringContent("{}", Encoding.UTF8, "application/json"),
        };

        HttpResponseMessage response = await client.SendAsync(requestMessage);
        string responseBody = await response.Content.ReadAsStringAsync();

        scenario[ResponseKey] = response;
        scenario[ResponseBodyKey] = responseBody;
    }

    [Given("I have registered a new account")]
    public async Task GivenIHaveRegisteredANewAccount()
    {
        HttpClient client = GetClient();
        string suffix = Guid.NewGuid().ToString("N")[..8];
        var registrationData = new
        {
            username = $"newuser-{suffix}",
            firstName = "New",
            lastName = "User",
            email = $"newuser-{suffix}@example.com",
            dateOfBirth = "1990-01-01",
            password = "Password1!",
        };

        string body = JsonSerializer.Serialize(registrationData);
        HttpRequestMessage requestMessage = new(HttpMethod.Post, "/api/auth/register")
        {
            Content = new StringContent(body, Encoding.UTF8, "application/json"),
        };

        HttpResponseMessage response = await client.SendAsync(requestMessage);
        string responseBody = await response.Content.ReadAsStringAsync();
        scenario[ResponseKey] = response;
        scenario[ResponseBodyKey] = responseBody;

        using JsonDocument doc = JsonDocument.Parse(responseBody);
        JsonElement root = doc.RootElement;
        scenario[RegisteredUserIdKey] = ParseRegisteredUserId(root);
        scenario[RegisteredUsernameKey] = ParseRegisteredUsername(root);
    }

    [Given("I am logged in")]
    public async Task GivenIAmLoggedIn()
    {
        HttpClient client = GetClient();
        var loginData = new { username = FixtureUsername, password = FixturePassword };
        string body = JsonSerializer.Serialize(loginData);

        HttpRequestMessage requestMessage = new(HttpMethod.Post, "/api/auth/login")
        {
            Content = new StringContent(body, Encoding.UTF8, "application/json"),
        };

        HttpResponseMessage response = await client.SendAsync(requestMessage);
        string responseBody = await response.Content.ReadAsStringAsync();

        JsonDocument doc = JsonDocument.Parse(responseBody);
        JsonElement root = doc.RootElement;
        if (root.TryGetProperty("payload", out JsonElement payloadElem))
        {
            if (
                payloadElem.TryGetProperty("accessToken", out JsonElement tokenElem)
                || payloadElem.TryGetProperty("AccessToken", out tokenElem)
            )
                scenario["accessToken"] = tokenElem.GetString();
            if (
                payloadElem.TryGetProperty("refreshToken", out JsonElement refreshElem)
                || payloadElem.TryGetProperty("RefreshToken", out refreshElem)
            )
                scenario["refreshToken"] = refreshElem.GetString();
        }
    }

    [Given("I have a valid refresh token")]
    public async Task GivenIHaveAValidRefreshToken()
    {
        await GivenIAmLoggedIn();
    }

    [Given("I am logged in with an immediately-expiring refresh token")]
    public async Task GivenIAmLoggedInWithAnImmediatelyExpiringRefreshToken()
    {
        // For now, create a normal login; in production this would generate an expiring token
        await GivenIAmLoggedIn();
    }

    [Given("I have a valid access token for my account")]
    public void GivenIHaveAValidAccessTokenForMyAccount()
    {
        Guid userId = scenario.TryGetValue(RegisteredUserIdKey, out Guid id)
            ? id
            : throw new InvalidOperationException("registered user ID not found in scenario");
        string? username = scenario.TryGetValue<string>(RegisteredUsernameKey, out string? user)
            ? user
            : throw new InvalidOperationException("registered username not found in scenario");

        string secret = GetRequiredEnvVar("ACCESS_TOKEN_SECRET");
        scenario["accessToken"] = GenerateJwtToken(
            userId,
            username,
            secret,
            DateTime.UtcNow.AddMinutes(60)
        );
    }

    [Given("I have a valid confirmation token for my account")]
    public void GivenIHaveAValidConfirmationTokenForMyAccount()
    {
        Guid userId = scenario.TryGetValue(RegisteredUserIdKey, out Guid id)
            ? id
            : throw new InvalidOperationException("registered user ID not found in scenario");
        string? username = scenario.TryGetValue<string>(RegisteredUsernameKey, out string? user)
            ? user
            : throw new InvalidOperationException("registered username not found in scenario");

        string secret = GetRequiredEnvVar("CONFIRMATION_TOKEN_SECRET");
        scenario["confirmationToken"] = GenerateJwtToken(
            userId,
            username,
            secret,
            DateTime.UtcNow.AddMinutes(5)
        );
    }

    [Given("I have an expired confirmation token for my account")]
    public void GivenIHaveAnExpiredConfirmationTokenForMyAccount()
    {
        Guid userId = scenario.TryGetValue(RegisteredUserIdKey, out Guid id)
            ? id
            : throw new InvalidOperationException("registered user ID not found in scenario");
        string? username = scenario.TryGetValue<string>(RegisteredUsernameKey, out string? user)
            ? user
            : throw new InvalidOperationException("registered username not found in scenario");

        string secret = GetRequiredEnvVar("CONFIRMATION_TOKEN_SECRET");
        scenario["confirmationToken"] = GenerateJwtToken(
            userId,
            username,
            secret,
            DateTime.UtcNow.AddMinutes(-5)
        );
    }

    [Given("I have a confirmation token signed with the wrong secret")]
    public void GivenIHaveAConfirmationTokenSignedWithTheWrongSecret()
    {
        Guid userId = scenario.TryGetValue(RegisteredUserIdKey, out Guid id)
            ? id
            : throw new InvalidOperationException("registered user ID not found in scenario");
        string? username = scenario.TryGetValue<string>(RegisteredUsernameKey, out string? user)
            ? user
            : throw new InvalidOperationException("registered username not found in scenario");

        const string wrongSecret = "wrong-confirmation-secret-that-is-very-long-1234567890";
        scenario["confirmationToken"] = GenerateJwtToken(
            userId,
            username,
            wrongSecret,
            DateTime.UtcNow.AddMinutes(5)
        );
    }

    [When("I submit a request to a protected endpoint with a valid access token")]
    public async Task WhenISubmitARequestToAProtectedEndpointWithAValidAccessToken()
    {
        HttpClient client = GetClient();
        string? token = scenario.TryGetValue<string>("accessToken", out string? t)
            ? t
            : "invalid-token";

        HttpRequestMessage requestMessage = new(HttpMethod.Get, "/api/protected")
        {
            Headers = { { "Authorization", $"Bearer {token}" } },
        };

        HttpResponseMessage response = await client.SendAsync(requestMessage);
        string responseBody = await response.Content.ReadAsStringAsync();
        scenario[ResponseKey] = response;
        scenario[ResponseBodyKey] = responseBody;
    }

    [When("I submit a request to a protected endpoint with an invalid access token")]
    public async Task WhenISubmitARequestToAProtectedEndpointWithAnInvalidAccessToken()
    {
        HttpClient client = GetClient();
        HttpRequestMessage requestMessage = new(HttpMethod.Get, "/api/protected")
        {
            Headers = { { "Authorization", "Bearer invalid-token-format" } },
        };

        HttpResponseMessage response = await client.SendAsync(requestMessage);
        string responseBody = await response.Content.ReadAsStringAsync();
        scenario[ResponseKey] = response;
        scenario[ResponseBodyKey] = responseBody;
    }

    [When("I submit a confirmation request with the valid token")]
    public async Task WhenISubmitAConfirmationRequestWithTheValidToken()
    {
        HttpClient client = GetClient();
        string? token = scenario.TryGetValue<string>("confirmationToken", out string? t)
            ? t
            : "valid-token";
        string? accessToken = scenario.TryGetValue<string>("accessToken", out string? at)
            ? at
            : string.Empty;

        HttpRequestMessage requestMessage = new(
            HttpMethod.Post,
            $"/api/auth/confirm?token={Uri.EscapeDataString(token)}"
        );
        if (!string.IsNullOrEmpty(accessToken))
            requestMessage.Headers.Add("Authorization", $"Bearer {accessToken}");

        HttpResponseMessage response = await client.SendAsync(requestMessage);
        string responseBody = await response.Content.ReadAsStringAsync();
        scenario[ResponseKey] = response;
        scenario[ResponseBodyKey] = responseBody;
    }

    [When("I submit the same confirmation request again")]
    public async Task WhenISubmitTheSameConfirmationRequestAgain()
    {
        HttpClient client = GetClient();
        string? token = scenario.TryGetValue<string>("confirmationToken", out string? t)
            ? t
            : "valid-token";
        string? accessToken = scenario.TryGetValue<string>("accessToken", out string? at)
            ? at
            : string.Empty;

        HttpRequestMessage requestMessage = new(
            HttpMethod.Post,
            $"/api/auth/confirm?token={Uri.EscapeDataString(token)}"
        );
        if (!string.IsNullOrEmpty(accessToken))
            requestMessage.Headers.Add("Authorization", $"Bearer {accessToken}");

        HttpResponseMessage response = await client.SendAsync(requestMessage);
        string responseBody = await response.Content.ReadAsStringAsync();
        scenario[ResponseKey] = response;
        scenario[ResponseBodyKey] = responseBody;
    }

    [When("I submit a confirmation request with a malformed token")]
    public async Task WhenISubmitAConfirmationRequestWithAMalformedToken()
    {
        HttpClient client = GetClient();
        const string token = "malformed-token-not-jwt";
        string? accessToken = scenario.TryGetValue<string>("accessToken", out string? at)
            ? at
            : string.Empty;

        HttpRequestMessage requestMessage = new(
            HttpMethod.Post,
            $"/api/auth/confirm?token={Uri.EscapeDataString(token)}"
        );
        if (!string.IsNullOrEmpty(accessToken))
            requestMessage.Headers.Add("Authorization", $"Bearer {accessToken}");

        HttpResponseMessage response = await client.SendAsync(requestMessage);
        string responseBody = await response.Content.ReadAsStringAsync();
        scenario[ResponseKey] = response;
        scenario[ResponseBodyKey] = responseBody;
    }

    [When("I submit a refresh token request with a valid refresh token")]
    public async Task WhenISubmitARefreshTokenRequestWithTheValidRefreshToken()
    {
        HttpClient client = GetClient();
        if (scenario.TryGetValue<string>("accessToken", out string? oldAccessToken))
            scenario[PreviousAccessTokenKey] = oldAccessToken;
        if (scenario.TryGetValue<string>("refreshToken", out string? oldRefreshToken))
            scenario[PreviousRefreshTokenKey] = oldRefreshToken;

        string? token = scenario.TryGetValue<string>("refreshToken", out string? t)
            ? t
            : "valid-refresh-token";

        HttpRequestMessage requestMessage = new(HttpMethod.Post, "/api/auth/refresh");
        requestMessage.Headers.Add("X-Refresh-Token", token);

        HttpResponseMessage response = await client.SendAsync(requestMessage);
        string responseBody = await response.Content.ReadAsStringAsync();
        scenario[ResponseKey] = response;
        scenario[ResponseBodyKey] = responseBody;
    }

    [When("I submit a refresh token request with an invalid refresh token")]
    public async Task WhenISubmitARefreshTokenRequestWithAnInvalidRefreshToken()
    {
        HttpClient client = GetClient();

        HttpRequestMessage requestMessage = new(HttpMethod.Post, "/api/auth/refresh");
        requestMessage.Headers.Add("X-Refresh-Token", "invalid-refresh-token");

        HttpResponseMessage response = await client.SendAsync(requestMessage);
        string responseBody = await response.Content.ReadAsStringAsync();
        scenario[ResponseKey] = response;
        scenario[ResponseBodyKey] = responseBody;
    }

    [When("I submit a refresh token request with the expired refresh token")]
    public async Task WhenISubmitARefreshTokenRequestWithTheExpiredRefreshToken()
    {
        HttpClient client = GetClient();

        HttpRequestMessage requestMessage = new(HttpMethod.Post, "/api/auth/refresh");
        requestMessage.Headers.Add("X-Refresh-Token", "expired-refresh-token");

        HttpResponseMessage response = await client.SendAsync(requestMessage);
        string responseBody = await response.Content.ReadAsStringAsync();
        scenario[ResponseKey] = response;
        scenario[ResponseBodyKey] = responseBody;
    }

    [When("I submit a refresh token request with a missing refresh token")]
    public async Task WhenISubmitARefreshTokenRequestWithAMissingRefreshToken()
    {
        HttpClient client = GetClient();

        HttpRequestMessage requestMessage = new(HttpMethod.Post, "/api/auth/refresh");

        HttpResponseMessage response = await client.SendAsync(requestMessage);
        string responseBody = await response.Content.ReadAsStringAsync();
        scenario[ResponseKey] = response;
        scenario[ResponseBodyKey] = responseBody;
    }

    [When("I submit a refresh token request using a GET request")]
    public async Task WhenISubmitARefreshTokenRequestUsingAGetRequest()
    {
        HttpClient client = GetClient();
        HttpRequestMessage requestMessage = new(HttpMethod.Get, "/api/auth/refresh")
        {
            Content = new StringContent("{}", Encoding.UTF8, "application/json"),
        };

        HttpResponseMessage response = await client.SendAsync(requestMessage);
        string responseBody = await response.Content.ReadAsStringAsync();
        scenario[ResponseKey] = response;
        scenario[ResponseBodyKey] = responseBody;
    }

    // Protected Endpoint Steps
    [When("I submit a request to a protected endpoint without an access token")]
    public async Task WhenISubmitARequestToAProtectedEndpointWithoutAnAccessToken()
    {
        HttpClient client = GetClient();
        HttpRequestMessage requestMessage = new(HttpMethod.Get, "/api/protected");

        HttpResponseMessage response = await client.SendAsync(requestMessage);
        string responseBody = await response.Content.ReadAsStringAsync();
        scenario[ResponseKey] = response;
        scenario[ResponseBodyKey] = responseBody;
    }

    [Given("I am logged in with an immediately-expiring access token")]
    public Task GivenIAmLoggedInWithAnImmediatelyExpiringAccessToken()
    {
        // Simulate an expired access token for auth rejection behavior.
        scenario["accessToken"] = "expired-access-token";
        return Task.CompletedTask;
    }

    [Given("I have an access token signed with the wrong secret")]
    public void GivenIHaveAnAccessTokenSignedWithTheWrongSecret()
    {
        // Create a token with a different secret
        scenario["accessToken"] =
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
    }

    [When("I submit a request to a protected endpoint with the expired token")]
    public async Task WhenISubmitARequestToAProtectedEndpointWithTheExpiredToken()
    {
        HttpClient client = GetClient();
        string? token = scenario.TryGetValue<string>("accessToken", out string? t)
            ? t
            : "expired-token";

        HttpRequestMessage requestMessage = new(HttpMethod.Get, "/api/protected")
        {
            Headers = { { "Authorization", $"Bearer {token}" } },
        };

        HttpResponseMessage response = await client.SendAsync(requestMessage);
        string responseBody = await response.Content.ReadAsStringAsync();
        scenario[ResponseKey] = response;
        scenario[ResponseBodyKey] = responseBody;
    }

    [When("I submit a request to a protected endpoint with the tampered token")]
    public async Task WhenISubmitARequestToAProtectedEndpointWithTheTamperedToken()
    {
        HttpClient client = GetClient();
        string? token = scenario.TryGetValue<string>("accessToken", out string? t)
            ? t
            : "tampered-token";

        HttpRequestMessage requestMessage = new(HttpMethod.Get, "/api/protected")
        {
            Headers = { { "Authorization", $"Bearer {token}" } },
        };

        HttpResponseMessage response = await client.SendAsync(requestMessage);
        string responseBody = await response.Content.ReadAsStringAsync();
        scenario[ResponseKey] = response;
        scenario[ResponseBodyKey] = responseBody;
    }

    [When(
        "I submit a request to a protected endpoint with my refresh token instead of access token"
    )]
    public async Task WhenISubmitARequestToAProtectedEndpointWithMyRefreshTokenInsteadOfAccessToken()
    {
        HttpClient client = GetClient();
        string? token = scenario.TryGetValue<string>("refreshToken", out string? t)
            ? t
            : "refresh-token";

        HttpRequestMessage requestMessage = new(HttpMethod.Get, "/api/protected")
        {
            Headers = { { "Authorization", $"Bearer {token}" } },
        };

        HttpResponseMessage response = await client.SendAsync(requestMessage);
        string responseBody = await response.Content.ReadAsStringAsync();
        scenario[ResponseKey] = response;
        scenario[ResponseBodyKey] = responseBody;
    }

    [Given("I have a valid confirmation token")]
    public void GivenIHaveAValidConfirmationToken()
    {
        scenario["confirmationToken"] = "valid-confirmation-token";
    }

    [When("I submit a confirmation request with the expired token")]
    public async Task WhenISubmitAConfirmationRequestWithTheExpiredToken()
    {
        HttpClient client = GetClient();
        string? token = scenario.TryGetValue<string>("confirmationToken", out string? t)
            ? t
            : "expired-confirmation-token";
        string? accessToken = scenario.TryGetValue<string>("accessToken", out string? at)
            ? at
            : string.Empty;

        HttpRequestMessage requestMessage = new(
            HttpMethod.Post,
            $"/api/auth/confirm?token={Uri.EscapeDataString(token)}"
        );
        if (!string.IsNullOrEmpty(accessToken))
            requestMessage.Headers.Add("Authorization", $"Bearer {accessToken}");

        HttpResponseMessage response = await client.SendAsync(requestMessage);
        string responseBody = await response.Content.ReadAsStringAsync();
        scenario[ResponseKey] = response;
        scenario[ResponseBodyKey] = responseBody;
    }

    [When("I submit a confirmation request with the tampered token")]
    public async Task WhenISubmitAConfirmationRequestWithTheTamperedToken()
    {
        HttpClient client = GetClient();
        string? token = scenario.TryGetValue<string>("confirmationToken", out string? t)
            ? t
            : "tampered-confirmation-token";
        string? accessToken = scenario.TryGetValue<string>("accessToken", out string? at)
            ? at
            : string.Empty;

        HttpRequestMessage requestMessage = new(
            HttpMethod.Post,
            $"/api/auth/confirm?token={Uri.EscapeDataString(token)}"
        );
        if (!string.IsNullOrEmpty(accessToken))
            requestMessage.Headers.Add("Authorization", $"Bearer {accessToken}");

        HttpResponseMessage response = await client.SendAsync(requestMessage);
        string responseBody = await response.Content.ReadAsStringAsync();
        scenario[ResponseKey] = response;
        scenario[ResponseBodyKey] = responseBody;
    }

    [When("I submit a confirmation request with a missing token")]
    public async Task WhenISubmitAConfirmationRequestWithAMissingToken()
    {
        HttpClient client = GetClient();
        string? accessToken = scenario.TryGetValue<string>("accessToken", out string? at)
            ? at
            : string.Empty;

        HttpRequestMessage requestMessage = new(HttpMethod.Post, "/api/auth/confirm");
        if (!string.IsNullOrEmpty(accessToken))
            requestMessage.Headers.Add("Authorization", $"Bearer {accessToken}");

        HttpResponseMessage response = await client.SendAsync(requestMessage);
        string responseBody = await response.Content.ReadAsStringAsync();
        scenario[ResponseKey] = response;
        scenario[ResponseBodyKey] = responseBody;
    }

    [When("I submit a confirmation request using an invalid HTTP method")]
    public async Task WhenISubmitAConfirmationRequestUsingAnInvalidHttpMethod()
    {
        HttpClient client = GetClient();
        string? token = scenario.TryGetValue<string>("confirmationToken", out string? t)
            ? t
            : "valid-confirmation-token";

        HttpRequestMessage requestMessage = new(
            HttpMethod.Get,
            $"/api/auth/confirm?token={Uri.EscapeDataString(token)}"
        );

        HttpResponseMessage response = await client.SendAsync(requestMessage);
        string responseBody = await response.Content.ReadAsStringAsync();
        scenario[ResponseKey] = response;
        scenario[ResponseBodyKey] = responseBody;
    }

    [When(
        "I submit a request to a protected endpoint with my confirmation token instead of access token"
    )]
    public async Task WhenISubmitARequestToAProtectedEndpointWithMyConfirmationTokenInsteadOfAccessToken()
    {
        HttpClient client = GetClient();
        string? token = scenario.TryGetValue<string>("confirmationToken", out string? t)
            ? t
            : "confirmation-token";

        HttpRequestMessage requestMessage = new(HttpMethod.Get, "/api/protected")
        {
            Headers = { { "Authorization", $"Bearer {token}" } },
        };

        HttpResponseMessage response = await client.SendAsync(requestMessage);
        string responseBody = await response.Content.ReadAsStringAsync();
        scenario[ResponseKey] = response;
        scenario[ResponseBodyKey] = responseBody;
    }

    [When("I submit a confirmation request with an invalid token")]
    public async Task WhenISubmitAConfirmationRequestWithAnInvalidToken()
    {
        HttpClient client = GetClient();
        const string token = "invalid-confirmation-token";
        string? accessToken = scenario.TryGetValue<string>("accessToken", out string? at)
            ? at
            : string.Empty;

        HttpRequestMessage requestMessage = new(
            HttpMethod.Post,
            $"/api/auth/confirm?token={Uri.EscapeDataString(token)}"
        );
        if (!string.IsNullOrEmpty(accessToken))
            requestMessage.Headers.Add("Authorization", $"Bearer {accessToken}");

        HttpResponseMessage response = await client.SendAsync(requestMessage);
        string responseBody = await response.Content.ReadAsStringAsync();
        scenario[ResponseKey] = response;
        scenario[ResponseBodyKey] = responseBody;
    }

    [When("I submit a confirmation request with the valid token without an access token")]
    public async Task WhenISubmitAConfirmationRequestWithTheValidTokenWithoutAnAccessToken()
    {
        HttpClient client = GetClient();
        string? token = scenario.TryGetValue<string>("confirmationToken", out string? t)
            ? t
            : "valid-token";

        HttpRequestMessage requestMessage = new(
            HttpMethod.Post,
            $"/api/auth/confirm?token={Uri.EscapeDataString(token)}"
        );

        HttpResponseMessage response = await client.SendAsync(requestMessage);
        string responseBody = await response.Content.ReadAsStringAsync();
        scenario[ResponseKey] = response;
        scenario[ResponseBodyKey] = responseBody;
    }

    [Then("the response JSON should have a new access token")]
    public void ThenTheResponseJsonShouldHaveANewAccessToken()
    {
        scenario.TryGetValue<string>(ResponseBodyKey, out string? responseBody).Should().BeTrue();

        using JsonDocument doc = JsonDocument.Parse(responseBody!);
        JsonElement payload = doc.RootElement.GetProperty("payload");
        string accessToken = ParseTokenFromPayload(payload, "accessToken", "AccessToken");

        accessToken.Should().NotBeNullOrWhiteSpace();

        if (scenario.TryGetValue<string>(PreviousAccessTokenKey, out string? previousAccessToken))
            accessToken.Should().NotBe(previousAccessToken);
    }

    [Then("the response JSON should have a new refresh token")]
    public void ThenTheResponseJsonShouldHaveANewRefreshToken()
    {
        scenario.TryGetValue<string>(ResponseBodyKey, out string? responseBody).Should().BeTrue();

        using JsonDocument doc = JsonDocument.Parse(responseBody!);
        JsonElement payload = doc.RootElement.GetProperty("payload");
        string refreshToken = ParseTokenFromPayload(payload, "refreshToken", "RefreshToken");

        refreshToken.Should().NotBeNullOrWhiteSpace();

        if (scenario.TryGetValue<string>(PreviousRefreshTokenKey, out string? previousRefreshToken))
            refreshToken.Should().NotBe(previousRefreshToken);
    }

    [Given("I have confirmed my account")]
    public async Task GivenIHaveConfirmedMyAccount()
    {
        HttpClient client = GetClient();
        string? token = scenario.TryGetValue<string>("confirmationToken", out string? t)
            ? t
            : throw new InvalidOperationException("confirmation token not found");
        string? accessToken = scenario.TryGetValue<string>("accessToken", out string? at)
            ? at
            : string.Empty;

        HttpRequestMessage requestMessage = new(
            HttpMethod.Post,
            $"/api/auth/confirm?token={Uri.EscapeDataString(token)}"
        );
        if (!string.IsNullOrEmpty(accessToken))
            requestMessage.Headers.Add("Authorization", $"Bearer {accessToken}");

        HttpResponseMessage response = await client.SendAsync(requestMessage);
        response.EnsureSuccessStatusCode();
    }

    [When("I submit a resend confirmation request for my account")]
    public async Task WhenISubmitAResendConfirmationRequestForMyAccount()
    {
        HttpClient client = GetClient();
        Guid userId = scenario.TryGetValue(RegisteredUserIdKey, out Guid id)
            ? id
            : throw new InvalidOperationException("registered user ID not found");
        string? accessToken = scenario.TryGetValue<string>("accessToken", out string? at)
            ? at
            : string.Empty;

        HttpRequestMessage requestMessage = new(
            HttpMethod.Post,
            $"/api/auth/confirm/resend?userId={userId}"
        );
        if (!string.IsNullOrEmpty(accessToken))
            requestMessage.Headers.Add("Authorization", $"Bearer {accessToken}");

        HttpResponseMessage response = await client.SendAsync(requestMessage);
        string responseBody = await response.Content.ReadAsStringAsync();
        scenario[ResponseKey] = response;
        scenario[ResponseBodyKey] = responseBody;
    }

    [When("I submit a resend confirmation request for a non-existent user")]
    public async Task WhenISubmitAResendConfirmationRequestForANonExistentUser()
    {
        HttpClient client = GetClient();
        Guid fakeUserId = Guid.NewGuid();
        string? accessToken = scenario.TryGetValue<string>("accessToken", out string? at)
            ? at
            : string.Empty;

        HttpRequestMessage requestMessage = new(
            HttpMethod.Post,
            $"/api/auth/confirm/resend?userId={fakeUserId}"
        );
        if (!string.IsNullOrEmpty(accessToken))
            requestMessage.Headers.Add("Authorization", $"Bearer {accessToken}");

        HttpResponseMessage response = await client.SendAsync(requestMessage);
        string responseBody = await response.Content.ReadAsStringAsync();
        scenario[ResponseKey] = response;
        scenario[ResponseBodyKey] = responseBody;
    }

    [When("I submit a resend confirmation request without an access token")]
    public async Task WhenISubmitAResendConfirmationRequestWithoutAnAccessToken()
    {
        HttpClient client = GetClient();
        Guid userId = scenario.TryGetValue(RegisteredUserIdKey, out Guid id)
            ? id
            : Guid.NewGuid();

        HttpRequestMessage requestMessage = new(
            HttpMethod.Post,
            $"/api/auth/confirm/resend?userId={userId}"
        );

        HttpResponseMessage response = await client.SendAsync(requestMessage);
        string responseBody = await response.Content.ReadAsStringAsync();
        scenario[ResponseKey] = response;
        scenario[ResponseBodyKey] = responseBody;
    }
}
