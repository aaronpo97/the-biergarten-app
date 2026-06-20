using System.Text;
using System.Text.Json;
using FluentAssertions;
using Reqnroll;

namespace API.Specs.Steps;

[Binding]
public class ApiGeneralSteps(ScenarioContext scenario)
{
    private const string ClientKey = "client";
    private const string FactoryKey = "factory";
    private const string ResponseKey = "response";
    private const string ResponseBodyKey = "responseBody";

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

    [Given("the API is running")]
    public void GivenTheApiIsRunning()
    {
        GetClient();
    }

    [When("I send an HTTP request {string} to {string} with body:")]
    public async Task WhenISendAnHttpRequestStringToStringWithBody(
        string method,
        string url,
        string jsonBody
    )
    {
        HttpClient client = GetClient();

        HttpRequestMessage requestMessage = new(new HttpMethod(method), url)
        {
            Content = new StringContent(jsonBody, Encoding.UTF8, "application/json"),
        };

        HttpResponseMessage response = await client.SendAsync(requestMessage);
        string responseBody = await response.Content.ReadAsStringAsync();

        scenario[ResponseKey] = response;
        scenario[ResponseBodyKey] = responseBody;
    }

    [When("I send an HTTP request {string} to {string}")]
    public async Task WhenISendAnHttpRequestStringToString(string method, string url)
    {
        HttpClient client = GetClient();
        HttpRequestMessage requestMessage = new(new HttpMethod(method), url);
        HttpResponseMessage response = await client.SendAsync(requestMessage);
        string responseBody = await response.Content.ReadAsStringAsync();

        scenario[ResponseKey] = response;
        scenario[ResponseBodyKey] = responseBody;
    }

    [Then("the response status code should be {int}")]
    public void ThenTheResponseStatusCodeShouldBeInt(int expected)
    {
        scenario
            .TryGetValue<HttpResponseMessage>(ResponseKey, out HttpResponseMessage? response)
            .Should()
            .BeTrue();
        ((int)response!.StatusCode).Should().Be(expected);
    }

    [Then("the response has HTTP status {int}")]
    public void ThenTheResponseHasHttpStatusInt(int expectedCode)
    {
        scenario
            .TryGetValue<HttpResponseMessage>(ResponseKey, out HttpResponseMessage? response)
            .Should()
            .BeTrue("No response was received from the API");
        ((int)response!.StatusCode).Should().Be(expectedCode);
    }

    [Then("the response JSON should have {string} equal {string}")]
    public void ThenTheResponseJsonShouldHaveStringEqualString(string field, string expected)
    {
        scenario
            .TryGetValue<HttpResponseMessage>(ResponseKey, out HttpResponseMessage? response)
            .Should()
            .BeTrue();
        scenario.TryGetValue<string>(ResponseBodyKey, out string? responseBody).Should().BeTrue();

        using JsonDocument doc = JsonDocument.Parse(responseBody!);
        JsonElement root = doc.RootElement;

        if (!root.TryGetProperty(field, out JsonElement value))
        {
            root.TryGetProperty("payload", out JsonElement payloadElem)
                .Should()
                .BeTrue(
                    "Expected field '{0}' to be present either at the root or inside 'payload'",
                    field
                );
            payloadElem.ValueKind.Should().Be(JsonValueKind.Object, "payload must be an object");
            payloadElem
                .TryGetProperty(field, out value)
                .Should()
                .BeTrue("Expected field '{0}' to be present inside 'payload'", field);
        }

        value
            .ValueKind.Should()
            .Be(JsonValueKind.String, "Expected field '{0}' to be a string", field);
        value.GetString().Should().Be(expected);
    }

    [Then("the response JSON should have {string} containing {string}")]
    public void ThenTheResponseJsonShouldHaveStringContainingString(
        string field,
        string expectedSubstring
    )
    {
        scenario
            .TryGetValue<HttpResponseMessage>(ResponseKey, out HttpResponseMessage? response)
            .Should()
            .BeTrue();
        scenario.TryGetValue<string>(ResponseBodyKey, out string? responseBody).Should().BeTrue();

        using JsonDocument doc = JsonDocument.Parse(responseBody!);
        JsonElement root = doc.RootElement;

        if (!root.TryGetProperty(field, out JsonElement value))
        {
            root.TryGetProperty("payload", out JsonElement payloadElem)
                .Should()
                .BeTrue(
                    "Expected field '{0}' to be present either at the root or inside 'payload'",
                    field
                );
            payloadElem.ValueKind.Should().Be(JsonValueKind.Object, "payload must be an object");
            payloadElem
                .TryGetProperty(field, out value)
                .Should()
                .BeTrue("Expected field '{0}' to be present inside 'payload'", field);
        }

        value
            .ValueKind.Should()
            .Be(JsonValueKind.String, "Expected field '{0}' to be a string", field);
        string? actualValue = value.GetString();
        actualValue
            .Should()
            .Contain(
                expectedSubstring,
                "Expected field '{0}' to contain '{1}' but was '{2}'",
                field,
                expectedSubstring,
                actualValue
            );
    }
}
