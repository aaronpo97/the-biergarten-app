using System.Net;
using System.Net.Http.Json;
using Reqnroll;
using FluentAssertions;

namespace API.Specs.Steps;

[Binding]
public class ApiSteps
{
    private readonly TestApiFactory _factory = new();
    private HttpClient? _client;
    private HttpResponseMessage? _response;

    private (string username, string password) testUser;

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
    public async Task ThenResponseJsonShouldHaveFieldEqual(string field, string expected)
    {
        _response.Should().NotBeNull();
        var dict = await _response!.Content.ReadFromJsonAsync<Dictionary<string, object>>();
        dict.Should().NotBeNull();
        dict!.TryGetValue(field, out var value).Should().BeTrue();
        (value?.ToString()).Should().Be(expected);
    }

    [When("I send an HTTP request {string} to {string} with body:")]
    public async Task WhenISendAnHttpRequestToWithBody(string method, string url, string jsonBody)
    {
        _client.Should().NotBeNull();

        var requestMessage = new HttpRequestMessage(new HttpMethod(method), url)
        {
            // Convert the string body into JSON content
            Content = new StringContent(jsonBody, System.Text.Encoding.UTF8, "application/json")
        };

        _response = await _client!.SendAsync(requestMessage);
    }

    [When("I send an HTTP request {string} to {string}")]
    public async Task WhenISendAnHttpRequestTo(string method, string url)
    {
        var requestMessage = new HttpRequestMessage(new HttpMethod(method), url);
        _response = await _client!.SendAsync(requestMessage);
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
        testUser = ("test.user", "password");
    }

    [Given("I submit a login request with a valid username and password")]
    public async Task GivenISubmitALoginRequestWithAValidUsernameAndPassword()
    {
        await WhenISendAnHttpRequestToWithBody("POST", "/api/v1/account/login", $@"
        {{
            ""username"": ""{testUser.username}"",
            ""password"": ""{testUser.password}""
        }}");
    }

    [Then("the response JSON should have a valid access token.")]
    public async Task ThenTheResponseJsonShouldHaveAValidAccessToken()
    {
        var dict = await _response!.Content.ReadFromJsonAsync<Dictionary<string, object>>();
        dict.Should().NotBeNull();
        
        dict!.TryGetValue("AccessToken", out var value).Should().BeTrue();

        var messageStr = value!.ToString();
        
        Console.WriteLine(messageStr);

    }
}