using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Reqnroll;
using FluentAssertions;
using System.IdentityModel.Tokens.Jwt;

namespace API.Specs.Steps;

[Binding]
public class ApiSteps
{
    private readonly TestApiFactory _factory = new();
    private HttpClient? _client;

    private HttpResponseMessage? _response;
    private string? _responseBody;

    private (string username, string password) _testUser;

    [Given("the API is running")]
    public void GivenTheApiIsRunning()
    {
        _client = _factory.CreateClient();
    }


    [Then("the response status code should be {int}")]
    public void ThenStatusCodeShouldBe(int expected)
    {
        _response.Should().NotBeNull();
        ((int)_response!.StatusCode).Should().Be(expected);
    }

    [Then("the response JSON should have {string} equal {string}")]
    public void ThenTheResponseJsonShouldHaveStringEqualString(string field, string expected)
    {
        _response.Should().NotBeNull();
        _responseBody.Should().NotBeNull();

        using var doc = JsonDocument.Parse(_responseBody!);
        var root = doc.RootElement;
        
        if (!root.TryGetProperty(field, out var value))
        {
            root.TryGetProperty("payload", out var payloadElem).Should().BeTrue("Expected field '{0}' to be present either at the root or inside 'payload'", field);
            payloadElem.ValueKind.Should().Be(JsonValueKind.Object, "payload must be an object");
            payloadElem.TryGetProperty(field, out value).Should().BeTrue("Expected field '{0}' to be present inside 'payload'", field);
        }

        value.ValueKind.Should().Be(JsonValueKind.String, "Expected field '{0}' to be a string", field);
        value.GetString().Should().Be(expected);
    }

    [When("I send an HTTP request {string} to {string} with body:")]
    public async Task WhenISendAnHttpRequestStringToStringWithBody(string method, string url, string jsonBody)
    {
        _client.Should().NotBeNull();

        var requestMessage = new HttpRequestMessage(new HttpMethod(method), url)
        {
            // Convert the string body into JSON content
            Content = new StringContent(jsonBody, System.Text.Encoding.UTF8, "application/json")
        };


        _response = await _client!.SendAsync(requestMessage);

        _responseBody = await _response.Content.ReadAsStringAsync();
    }

    [When("I send an HTTP request {string} to {string}")]
    public async Task WhenISendAnHttpRequestTo(string method, string url)
    {
        var requestMessage = new HttpRequestMessage(new HttpMethod(method), url);
        _response = await _client!.SendAsync(requestMessage);
        _responseBody = await _response.Content.ReadAsStringAsync();
    }

    [Then("the response has HTTP status {int}")]
    public void ThenTheResponseHasHttpStatusInt(int expectedCode)
    {
        _response.Should().NotBeNull("No response was received from the API");

        ((int)_response!.StatusCode).Should().Be(expectedCode);
    }

    [Given("I have an existing account")]
    public void GivenIHaveAnExistingAccount()
    {
        _testUser = ("test.user", "password");
    }

    [When("I submit a login request with a username and password")]
    public async Task WhenISubmitALoginRequestWithAUsernameAndPassword()
    {
        await WhenISendAnHttpRequestStringToStringWithBody("POST", "/api/auth/login", $@"
        {{
            ""username"": ""{_testUser.username}"",
            ""password"": ""{_testUser.password}""
        }}");
    }


    [Then("the response JSON should have an access token")]
    public void ThenTheResponseJsonShouldHaveAnAccessToken()
    {
        _response.Should().NotBeNull();
        _responseBody.Should().NotBeNull();

        using var doc = JsonDocument.Parse(_responseBody!);
        var root = doc.RootElement;
        JsonElement tokenElem;
        var hasToken = root.TryGetProperty("accessToken", out tokenElem)
                       || root.TryGetProperty("AccessToken", out tokenElem);

        if (!hasToken)
        {
            if (root.TryGetProperty("payload", out var payloadElem) && payloadElem.ValueKind == JsonValueKind.Object)
            {
                hasToken = payloadElem.TryGetProperty("accessToken", out tokenElem)
                           || payloadElem.TryGetProperty("AccessToken", out tokenElem);
            }
        }

        hasToken.Should().BeTrue("Expected an access token either at the root or inside 'payload'");

        var token = tokenElem.GetString();

        // @todo validate the token 

        token.Should().NotBeNullOrEmpty();
    }


    [Given("I do not have an existing account")]
    public void GivenIDoNotHaveAnExistingAccount()
    {
        _testUser = ("Failing", "User");
    }

    [When("I submit a login request with a missing username")]
    public async Task WhenISubmitALoginRequestWithAMissingUsername()
    {
        await WhenISendAnHttpRequestStringToStringWithBody("POST", "/api/auth/login", $@"
        {{
            ""password"": ""test""
        }}");
    }

    [When("I submit a login request with a missing password")]
    public async Task WhenISubmitALoginRequestWithAMissingPassword()
    {
        await WhenISendAnHttpRequestStringToStringWithBody("POST", "/api/auth/login", $@"
        {{
            ""username"": ""test""
        }}");
    }

    [When("I submit a login request with both username and password missing")]
    public async Task WhenISubmitALoginRequestWithBothUsernameAndPasswordMissing()
    {
        await WhenISendAnHttpRequestStringToStringWithBody("POST", "/api/auth/login", "{}");
    }
}