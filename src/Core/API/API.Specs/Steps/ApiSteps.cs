using System.Net;
using System.Net.Http.Json;
using Reqnroll;
using FluentAssertions;

namespace API.Specs.Steps;

[Binding]
public class ApiSteps
{
    private readonly TestApiFactory _factory;
    private HttpClient? _client;
    private HttpResponseMessage? _response;

    public ApiSteps()
    {
        _factory = new TestApiFactory();
    }

    [Given("the API is running")]
    public void GivenTheApiIsRunning()
    {
        _client = _factory.CreateClient();
    }

    // No user service assumptions needed for 404 tests

    [When("I GET {string}")]
    public async Task WhenIGet(string path)
    {
        _client.Should().NotBeNull("API client must be initialized");
        _response = await _client!.GetAsync(path);
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
}
