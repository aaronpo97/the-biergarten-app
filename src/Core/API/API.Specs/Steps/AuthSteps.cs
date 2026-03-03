using System.Text.Json;
using API.Specs;
using FluentAssertions;
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

    private HttpClient GetClient()
    {
        if (scenario.TryGetValue<HttpClient>(ClientKey, out var client))
        {
            return client;
        }

        var factory = scenario.TryGetValue<TestApiFactory>(
            FactoryKey,
            out var f
        )
            ? f
            : new TestApiFactory();
        scenario[FactoryKey] = factory;

        client = factory.CreateClient();
        scenario[ClientKey] = client;
        return client;
    }

    [Given("I have an existing account")]
    public void GivenIHaveAnExistingAccount()
    {
        scenario[TestUserKey] = ("test.user", "password");
    }

    [Given("I do not have an existing account")]
    public void GivenIDoNotHaveAnExistingAccount()
    {
        scenario[TestUserKey] = ("Failing", "User");
    }

    [When("I submit a login request with a username and password")]
    public async Task WhenISubmitALoginRequestWithAUsernameAndPassword()
    {
        var client = GetClient();
        var (username, password) = scenario.TryGetValue<(
            string username,
            string password
        )>(TestUserKey, out var user)
            ? user
            : ("test.user", "password");

        var body = JsonSerializer.Serialize(new { username, password });

        var requestMessage = new HttpRequestMessage(
            HttpMethod.Post,
            "/api/auth/login"
        )
        {
            Content = new StringContent(
                body,
                System.Text.Encoding.UTF8,
                "application/json"
            ),
        };

        var response = await client.SendAsync(requestMessage);
        var responseBody = await response.Content.ReadAsStringAsync();

        scenario[ResponseKey] = response;
        scenario[ResponseBodyKey] = responseBody;
    }

    [When("I submit a login request with a missing username")]
    public async Task WhenISubmitALoginRequestWithAMissingUsername()
    {
        var client = GetClient();
        var body = JsonSerializer.Serialize(new { password = "test" });

        var requestMessage = new HttpRequestMessage(
            HttpMethod.Post,
            "/api/auth/login"
        )
        {
            Content = new StringContent(
                body,
                System.Text.Encoding.UTF8,
                "application/json"
            ),
        };

        var response = await client.SendAsync(requestMessage);
        var responseBody = await response.Content.ReadAsStringAsync();

        scenario[ResponseKey] = response;
        scenario[ResponseBodyKey] = responseBody;
    }

    [When("I submit a login request with a missing password")]
    public async Task WhenISubmitALoginRequestWithAMissingPassword()
    {
        var client = GetClient();
        var body = JsonSerializer.Serialize(new { username = "test" });

        var requestMessage = new HttpRequestMessage(
            HttpMethod.Post,
            "/api/auth/login"
        )
        {
            Content = new StringContent(
                body,
                System.Text.Encoding.UTF8,
                "application/json"
            ),
        };

        var response = await client.SendAsync(requestMessage);
        var responseBody = await response.Content.ReadAsStringAsync();

        scenario[ResponseKey] = response;
        scenario[ResponseBodyKey] = responseBody;
    }

    [When("I submit a login request with both username and password missing")]
    public async Task WhenISubmitALoginRequestWithBothUsernameAndPasswordMissing()
    {
        var client = GetClient();
        var requestMessage = new HttpRequestMessage(
            HttpMethod.Post,
            "/api/auth/login"
        )
        {
            Content = new StringContent(
                "{}",
                System.Text.Encoding.UTF8,
                "application/json"
            ),
        };

        var response = await client.SendAsync(requestMessage);
        var responseBody = await response.Content.ReadAsStringAsync();

        scenario[ResponseKey] = response;
        scenario[ResponseBodyKey] = responseBody;
    }

    [Then("the response JSON should have an access token")]
    public void ThenTheResponseJsonShouldHaveAnAccessToken()
    {
        scenario
            .TryGetValue<HttpResponseMessage>(ResponseKey, out var response)
            .Should()
            .BeTrue();
        scenario
            .TryGetValue<string>(ResponseBodyKey, out var responseBody)
            .Should()
            .BeTrue();

        var doc = JsonDocument.Parse(responseBody!);
        var root = doc.RootElement;
        JsonElement tokenElem = default;
        var hasToken = false;

        if (
            root.TryGetProperty("payload", out var payloadElem)
            && payloadElem.ValueKind == JsonValueKind.Object
        )
        {
            hasToken =
                payloadElem.TryGetProperty("accessToken", out tokenElem)
                || payloadElem.TryGetProperty("AccessToken", out tokenElem);
        }

        hasToken
            .Should()
            .BeTrue(
                "Expected an access token either at the root or inside 'payload'"
            );

        var token = tokenElem.GetString();
        token.Should().NotBeNullOrEmpty();
    }

    [When("I submit a login request using a GET request")]
    public async Task WhenISubmitALoginRequestUsingAgetRequest()
    {
        var client = GetClient();
        // testing GET
        var requestMessage = new HttpRequestMessage(
            HttpMethod.Get,
            "/api/auth/login"
        )
        {
            Content = new StringContent(
                "{}",
                System.Text.Encoding.UTF8,
                "application/json"
            ),
        };

        var response = await client.SendAsync(requestMessage);
        var responseBody = await response.Content.ReadAsStringAsync();

        scenario[ResponseKey] = response;
        scenario[ResponseBodyKey] = responseBody;
    }

    [When("I submit a registration request with values:")]
    public async Task WhenISubmitARegistrationRequestWithValues(Table table)
    {
        var client = GetClient();
        var row = table.Rows[0];

        var username = row["Username"] ?? "";
        var firstName = row["FirstName"] ?? "";
        var lastName = row["LastName"] ?? "";
        var email = row["Email"] ?? "";
        var dateOfBirth = row["DateOfBirth"] ?? "";

        if (dateOfBirth == "{underage_date}")
        {
            dateOfBirth = DateTime.UtcNow.AddYears(-18).ToString("yyyy-MM-dd");
        }

        var password = row["Password"];

        var registrationData = new
        {
            username,
            firstName,
            lastName,
            email,
            dateOfBirth,
            password,
        };

        var body = JsonSerializer.Serialize(registrationData);

        var requestMessage = new HttpRequestMessage(
            HttpMethod.Post,
            "/api/auth/register"
        )
        {
            Content = new StringContent(
                body,
                System.Text.Encoding.UTF8,
                "application/json"
            ),
        };

        var response = await client.SendAsync(requestMessage);
        var responseBody = await response.Content.ReadAsStringAsync();

        scenario[ResponseKey] = response;
        scenario[ResponseBodyKey] = responseBody;
    }

    [When("I submit a registration request using a GET request")]
    public async Task WhenISubmitARegistrationRequestUsingAGetRequest()
    {
        var client = GetClient();
        var requestMessage = new HttpRequestMessage(
            HttpMethod.Get,
            "/api/auth/register"
        )
        {
            Content = new StringContent(
                "{}",
                System.Text.Encoding.UTF8,
                "application/json"
            ),
        };

        var response = await client.SendAsync(requestMessage);
        var responseBody = await response.Content.ReadAsStringAsync();

        scenario[ResponseKey] = response;
        scenario[ResponseBodyKey] = responseBody;
    }

    [Given("I have registered a new account")]
    public async Task GivenIHaveRegisteredANewAccount()
    {
        var client = GetClient();
        var registrationData = new
        {
            username = "newuser",
            firstName = "New",
            lastName = "User",
            email = "newuser@example.com",
            dateOfBirth = "1990-01-01",
            password = "Password1!",
        };

        var body = JsonSerializer.Serialize(registrationData);
        var requestMessage = new HttpRequestMessage(
            HttpMethod.Post,
            "/api/auth/register"
        )
        {
            Content = new StringContent(
                body,
                System.Text.Encoding.UTF8,
                "application/json"
            ),
        };

        var response = await client.SendAsync(requestMessage);
        var responseBody = await response.Content.ReadAsStringAsync();
        scenario[ResponseKey] = response;
        scenario[ResponseBodyKey] = responseBody;
    }

    [Given("I am logged in")]
    public async Task GivenIAmLoggedIn()
    {
        var client = GetClient();
        var loginData = new { username = "test.user", password = "password" };
        var body = JsonSerializer.Serialize(loginData);

        var requestMessage = new HttpRequestMessage(
            HttpMethod.Post,
            "/api/auth/login"
        )
        {
            Content = new StringContent(
                body,
                System.Text.Encoding.UTF8,
                "application/json"
            ),
        };

        var response = await client.SendAsync(requestMessage);
        var responseBody = await response.Content.ReadAsStringAsync();

        var doc = JsonDocument.Parse(responseBody);
        var root = doc.RootElement;
        if (root.TryGetProperty("payload", out var payloadElem))
        {
            if (
                payloadElem.TryGetProperty("accessToken", out var tokenElem)
                || payloadElem.TryGetProperty("AccessToken", out tokenElem)
            )
            {
                scenario["accessToken"] = tokenElem.GetString();
            }
            if (
                payloadElem.TryGetProperty("refreshToken", out var refreshElem)
                || payloadElem.TryGetProperty("RefreshToken", out refreshElem)
            )
            {
                scenario["refreshToken"] = refreshElem.GetString();
            }
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

    [Given("I have a valid confirmation token for my account")]
    public void GivenIHaveAValidConfirmationTokenForMyAccount()
    {
        // Store a valid confirmation token - in real scenario this would be generated
        scenario["confirmationToken"] = "valid-confirmation-token";
    }

    [When(
        "I submit a request to a protected endpoint with a valid access token"
    )]
    public async Task WhenISubmitARequestToAProtectedEndpointWithAValidAccessToken()
    {
        var client = GetClient();
        var token = scenario.TryGetValue<string>("accessToken", out var t)
            ? t
            : "invalid-token";

        var requestMessage = new HttpRequestMessage(
            HttpMethod.Get,
            "/api/protected"
        )
        {
            Headers = { { "Authorization", $"Bearer {token}" } },
        };

        var response = await client.SendAsync(requestMessage);
        scenario[ResponseKey] = response;
    }

    [When(
        "I submit a request to a protected endpoint with an invalid access token"
    )]
    public async Task WhenISubmitARequestToAProtectedEndpointWithAnInvalidAccessToken()
    {
        var client = GetClient();
        var requestMessage = new HttpRequestMessage(
            HttpMethod.Get,
            "/api/protected"
        )
        {
            Headers = { { "Authorization", "Bearer invalid-token-format" } },
        };

        var response = await client.SendAsync(requestMessage);
        scenario[ResponseKey] = response;
    }

    [When("I submit a confirmation request with the valid token")]
    public async Task WhenISubmitAConfirmationRequestWithTheValidToken()
    {
        var client = GetClient();
        var token = scenario.TryGetValue<string>("confirmationToken", out var t)
            ? t
            : "valid-token";
        var body = JsonSerializer.Serialize(new { token });

        var requestMessage = new HttpRequestMessage(
            HttpMethod.Post,
            "/api/auth/confirm"
        )
        {
            Content = new StringContent(
                body,
                System.Text.Encoding.UTF8,
                "application/json"
            ),
        };

        var response = await client.SendAsync(requestMessage);
        var responseBody = await response.Content.ReadAsStringAsync();
        scenario[ResponseKey] = response;
        scenario[ResponseBodyKey] = responseBody;
    }

    [When("I submit a confirmation request with a malformed token")]
    public async Task WhenISubmitAConfirmationRequestWithAMalformedToken()
    {
        var client = GetClient();
        var body = JsonSerializer.Serialize(
            new { token = "malformed-token-not-jwt" }
        );

        var requestMessage = new HttpRequestMessage(
            HttpMethod.Post,
            "/api/auth/confirm"
        )
        {
            Content = new StringContent(
                body,
                System.Text.Encoding.UTF8,
                "application/json"
            ),
        };

        var response = await client.SendAsync(requestMessage);
        var responseBody = await response.Content.ReadAsStringAsync();
        scenario[ResponseKey] = response;
        scenario[ResponseBodyKey] = responseBody;
    }

    [When("I submit a refresh token request with the valid refresh token")]
    public async Task WhenISubmitARefreshTokenRequestWithTheValidRefreshToken()
    {
        var client = GetClient();
        var token = scenario.TryGetValue<string>("refreshToken", out var t)
            ? t
            : "valid-refresh-token";
        var body = JsonSerializer.Serialize(new { refreshToken = token });

        var requestMessage = new HttpRequestMessage(
            HttpMethod.Post,
            "/api/auth/refresh"
        )
        {
            Content = new StringContent(
                body,
                System.Text.Encoding.UTF8,
                "application/json"
            ),
        };

        var response = await client.SendAsync(requestMessage);
        var responseBody = await response.Content.ReadAsStringAsync();
        scenario[ResponseKey] = response;
        scenario[ResponseBodyKey] = responseBody;
    }

    [When("I submit a refresh token request with the expired refresh token")]
    public async Task WhenISubmitARefreshTokenRequestWithTheExpiredRefreshToken()
    {
        var client = GetClient();
        // Use an expired token
        var body = JsonSerializer.Serialize(
            new { refreshToken = "expired-refresh-token" }
        );

        var requestMessage = new HttpRequestMessage(
            HttpMethod.Post,
            "/api/auth/refresh"
        )
        {
            Content = new StringContent(
                body,
                System.Text.Encoding.UTF8,
                "application/json"
            ),
        };

        var response = await client.SendAsync(requestMessage);
        var responseBody = await response.Content.ReadAsStringAsync();
        scenario[ResponseKey] = response;
        scenario[ResponseBodyKey] = responseBody;
    }

    [When("I submit a refresh token request with a missing refresh token")]
    public async Task WhenISubmitARefreshTokenRequestWithAMissingRefreshToken()
    {
        var client = GetClient();
        var body = JsonSerializer.Serialize(new { });

        var requestMessage = new HttpRequestMessage(
            HttpMethod.Post,
            "/api/auth/refresh"
        )
        {
            Content = new StringContent(
                body,
                System.Text.Encoding.UTF8,
                "application/json"
            ),
        };

        var response = await client.SendAsync(requestMessage);
        var responseBody = await response.Content.ReadAsStringAsync();
        scenario[ResponseKey] = response;
        scenario[ResponseBodyKey] = responseBody;
    }

    [When("I submit a refresh token request using a GET request")]
    public async Task WhenISubmitARefreshTokenRequestUsingAGETRequest()
    {
        var client = GetClient();
        var requestMessage = new HttpRequestMessage(
            HttpMethod.Get,
            "/api/auth/refresh"
        )
        {
            Content = new StringContent(
                "{}",
                System.Text.Encoding.UTF8,
                "application/json"
            ),
        };

        var response = await client.SendAsync(requestMessage);
        scenario[ResponseKey] = response;
    }

    // Protected Endpoint Steps
    [When("I submit a request to a protected endpoint without an access token")]
    public async Task WhenISubmitARequestToAProtectedEndpointWithoutAnAccessToken()
    {
        var client = GetClient();
        var requestMessage = new HttpRequestMessage(
            HttpMethod.Get,
            "/api/protected"
        );

        var response = await client.SendAsync(requestMessage);
        scenario[ResponseKey] = response;
    }

    [Given("I am logged in with an immediately-expiring access token")]
    public async Task GivenIAmLoggedInWithAnImmediatelyExpiringAccessToken()
    {
        // For now, create a normal login; in production this would generate an immediately-expiring token
        await GivenIAmLoggedIn();
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
        var client = GetClient();
        var token = scenario.TryGetValue<string>("accessToken", out var t)
            ? t
            : "expired-token";

        var requestMessage = new HttpRequestMessage(
            HttpMethod.Get,
            "/api/protected"
        )
        {
            Headers = { { "Authorization", $"Bearer {token}" } },
        };

        var response = await client.SendAsync(requestMessage);
        scenario[ResponseKey] = response;
    }

    [When("I submit a request to a protected endpoint with the tampered token")]
    public async Task WhenISubmitARequestToAProtectedEndpointWithTheTamperedToken()
    {
        var client = GetClient();
        var token = scenario.TryGetValue<string>("accessToken", out var t)
            ? t
            : "tampered-token";

        var requestMessage = new HttpRequestMessage(
            HttpMethod.Get,
            "/api/protected"
        )
        {
            Headers = { { "Authorization", $"Bearer {token}" } },
        };

        var response = await client.SendAsync(requestMessage);
        scenario[ResponseKey] = response;
    }

    [When(
        "I submit a request to a protected endpoint with my refresh token instead of access token"
    )]
    public async Task WhenISubmitARequestToAProtectedEndpointWithMyRefreshTokenInsteadOfAccessToken()
    {
        var client = GetClient();
        var token = scenario.TryGetValue<string>("refreshToken", out var t)
            ? t
            : "refresh-token";

        var requestMessage = new HttpRequestMessage(
            HttpMethod.Get,
            "/api/protected"
        )
        {
            Headers = { { "Authorization", $"Bearer {token}" } },
        };

        var response = await client.SendAsync(requestMessage);
        scenario[ResponseKey] = response;
    }

    [Given("I have a valid confirmation token")]
    public void GivenIHaveAValidConfirmationToken()
    {
        scenario["confirmationToken"] = "valid-confirmation-token";
    }

    [When(
        "I submit a request to a protected endpoint with my confirmation token instead of access token"
    )]
    public async Task WhenISubmitARequestToAProtectedEndpointWithMyConfirmationTokenInsteadOfAccessToken()
    {
        var client = GetClient();
        var token = scenario.TryGetValue<string>("confirmationToken", out var t)
            ? t
            : "confirmation-token";

        var requestMessage = new HttpRequestMessage(
            HttpMethod.Get,
            "/api/protected"
        )
        {
            Headers = { { "Authorization", $"Bearer {token}" } },
        };

        var response = await client.SendAsync(requestMessage);
        scenario[ResponseKey] = response;
    }
}
