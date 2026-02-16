using System.Text.Json;
using API.Specs;
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
        var client = GetClient();

        var requestMessage = new HttpRequestMessage(new HttpMethod(method), url)
        {
            Content = new StringContent(
                jsonBody,
                System.Text.Encoding.UTF8,
                "application/json"
            ),
        };

        var response = await client.SendAsync(requestMessage);
        var responseBody = await response.Content.ReadAsStringAsync();

        scenario[ResponseKey] = response;
        scenario[ResponseBodyKey] = responseBody;
    }

    [When("I send an HTTP request {string} to {string}")]
    public async Task WhenISendAnHttpRequestStringToString(
        string method,
        string url
    )
    {
        var client = GetClient();
        var requestMessage = new HttpRequestMessage(
            new HttpMethod(method),
            url
        );
        var response = await client.SendAsync(requestMessage);
        var responseBody = await response.Content.ReadAsStringAsync();

        scenario[ResponseKey] = response;
        scenario[ResponseBodyKey] = responseBody;
    }

    [Then("the response status code should be {int}")]
    public void ThenTheResponseStatusCodeShouldBeInt(int expected)
    {
        scenario
            .TryGetValue<HttpResponseMessage>(ResponseKey, out var response)
            .Should()
            .BeTrue();
        ((int)response!.StatusCode).Should().Be(expected);
    }

    [Then("the response has HTTP status {int}")]
    public void ThenTheResponseHasHttpStatusInt(int expectedCode)
    {
        scenario
            .TryGetValue<HttpResponseMessage>(ResponseKey, out var response)
            .Should()
            .BeTrue("No response was received from the API");
        ((int)response!.StatusCode).Should().Be(expectedCode);
    }

    [Then("the response JSON should have {string} equal {string}")]
    public void ThenTheResponseJsonShouldHaveStringEqualString(
        string field,
        string expected
    )
    {
        scenario
            .TryGetValue<HttpResponseMessage>(ResponseKey, out var response)
            .Should()
            .BeTrue();
        scenario
            .TryGetValue<string>(ResponseBodyKey, out var responseBody)
            .Should()
            .BeTrue();

        using var doc = JsonDocument.Parse(responseBody!);
        var root = doc.RootElement;

        if (!root.TryGetProperty(field, out var value))
        {
            root.TryGetProperty("payload", out var payloadElem)
                .Should()
                .BeTrue(
                    "Expected field '{0}' to be present either at the root or inside 'payload'",
                    field
                );
            payloadElem
                .ValueKind.Should()
                .Be(JsonValueKind.Object, "payload must be an object");
            payloadElem
                .TryGetProperty(field, out value)
                .Should()
                .BeTrue(
                    "Expected field '{0}' to be present inside 'payload'",
                    field
                );
        }

        value
            .ValueKind.Should()
            .Be(
                JsonValueKind.String,
                "Expected field '{0}' to be a string",
                field
            );
        value.GetString().Should().Be(expected);
    }
}
