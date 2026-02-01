using System.Text.Json;
using Reqnroll;
using FluentAssertions;
using API.Specs;

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

        var factory = scenario.TryGetValue<TestApiFactory>(FactoryKey, out var f) ? f : new TestApiFactory();
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
        var (username, password) = scenario.TryGetValue<(string username, string password)>(TestUserKey, out var user)
            ? user
            : ("test.user", "password");

        var body = JsonSerializer.Serialize(new { username, password });

        var requestMessage = new HttpRequestMessage(HttpMethod.Post, "/api/auth/login")
        {
            Content = new StringContent(body, System.Text.Encoding.UTF8, "application/json")
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

        var requestMessage = new HttpRequestMessage(HttpMethod.Post, "/api/auth/login")
        {
            Content = new StringContent(body, System.Text.Encoding.UTF8, "application/json")
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

        var requestMessage = new HttpRequestMessage(HttpMethod.Post, "/api/auth/login")
        {
            Content = new StringContent(body, System.Text.Encoding.UTF8, "application/json")
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
        var requestMessage = new HttpRequestMessage(HttpMethod.Post, "/api/auth/login")
        {
            Content = new StringContent("{}", System.Text.Encoding.UTF8, "application/json")
        };

        var response = await client.SendAsync(requestMessage);
        var responseBody = await response.Content.ReadAsStringAsync();

        scenario[ResponseKey] = response;
        scenario[ResponseBodyKey] = responseBody;
    }

    [Then("the response JSON should have an access token")]
    public void ThenTheResponseJsonShouldHaveAnAccessToken()
    {
        scenario.TryGetValue<HttpResponseMessage>(ResponseKey, out var response).Should().BeTrue();
        scenario.TryGetValue<string>(ResponseBodyKey, out var responseBody).Should().BeTrue();

        var doc = JsonDocument.Parse(responseBody!);
        var root = doc.RootElement;
        JsonElement tokenElem = default;
        var hasToken = false;


        if (root.TryGetProperty("payload", out var payloadElem) && payloadElem.ValueKind == JsonValueKind.Object)
        {
            hasToken = payloadElem.TryGetProperty("accessToken", out tokenElem)
                       || payloadElem.TryGetProperty("AccessToken", out tokenElem);
        }


        hasToken.Should().BeTrue("Expected an access token either at the root or inside 'payload'");

        var token = tokenElem.GetString();
        token.Should().NotBeNullOrEmpty();
    }


    [When("I submit a login request using a GET request")]
    public async Task WhenISubmitALoginRequestUsingAgetRequest()
    {
        var client = GetClient();
        // testing GET
        var requestMessage = new HttpRequestMessage(HttpMethod.Get, "/api/auth/login")
        {
            Content = new StringContent("{}", System.Text.Encoding.UTF8, "application/json")
        };

        var response = await client.SendAsync(requestMessage);
        var responseBody = await response.Content.ReadAsStringAsync();

        scenario[ResponseKey] = response;
        scenario[ResponseBodyKey] = responseBody;
    }
}