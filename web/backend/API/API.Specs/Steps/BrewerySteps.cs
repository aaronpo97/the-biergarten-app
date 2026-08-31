using System.Text;
using System.Text.Json;
using Database.Connection;
using Features.Locations.Dtos;
using Features.Locations.Repository;
using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using Reqnroll;

namespace API.Specs.Steps;

[Binding]
public class BrewerySteps(ScenarioContext scenario) : ApiStepsBase(scenario)
{
    private const string AccessTokenKey = "accessToken";
    private const string CityIdKey = "cityId";
    private const string BreweryPostIdKey = "breweryPostId";
    private const string BreweryRowVersionKey = "breweryRowVersion";

    private const string FixtureCountryName = "Fixture Country";
    private const string FixtureCountryIsoCode = "FX";
    private const string FixtureStateProvinceName = "Fixture State";
    private const string FixtureStateProvinceIsoCode = "FX-TS";
    private const string FixtureCityName = "Fixture City";

    // GetOrCreateCityIdAsync is not fully race-safe under concurrent callers creating the same
    // city (see its remarks); scenarios run in parallel across feature classes, so provisioning
    // the shared fixture city is serialized the same way AuthSteps serializes its fixture account.
    private static readonly SemaphoreSlim CityProvisioningLock = new(1, 1);

    private HttpRequestMessage NewAuthenticatedRequest(HttpMethod method, string url)
    {
        HttpRequestMessage requestMessage = new(method, url);
        if (Scenario.TryGetValue<string>(AccessTokenKey, out string? accessToken))
            requestMessage.Headers.Add("Authorization", $"Bearer {accessToken}");
        return requestMessage;
    }

    private async Task SendAsync(HttpRequestMessage requestMessage)
    {
        HttpClient client = GetClient();
        HttpResponseMessage response = await client.SendAsync(requestMessage);
        string responseBody = await response.Content.ReadAsStringAsync();

        Scenario[ResponseKey] = response;
        Scenario[ResponseBodyKey] = responseBody;
    }

    [Given("a city exists")]
    public async Task GivenACityExists()
    {
        ISqlConnectionFactory connectionFactory = GetFactory()
            .Services.GetRequiredService<ISqlConnectionFactory>();
        LocationRepository repository = new(connectionFactory);

        CityLocation fixtureCity = new(
            FixtureCityName,
            FixtureStateProvinceName,
            FixtureStateProvinceIsoCode,
            FixtureCountryName,
            FixtureCountryIsoCode
        );

        await CityProvisioningLock.WaitAsync();
        Guid cityId;
        try
        {
            cityId = await repository.GetOrCreateCityIdAsync(fixtureCity);
        }
        finally
        {
            CityProvisioningLock.Release();
        }

        Scenario[CityIdKey] = cityId;
    }

    private async Task CreateBreweryAsync(
        string breweryName,
        string description,
        string addressLine1,
        string postalCode,
        Guid cityId
    )
    {
        var createData = new
        {
            breweryName,
            description,
            location = new
            {
                cityId,
                addressLine1,
                addressLine2 = (string?)null,
                postalCode,
                coordinates = (object?)null,
            },
        };

        HttpRequestMessage requestMessage = NewAuthenticatedRequest(
            HttpMethod.Post,
            "/api/brewery"
        );
        requestMessage.Content = new StringContent(
            JsonSerializer.Serialize(createData),
            Encoding.UTF8,
            "application/json"
        );

        await SendAsync(requestMessage);
    }

    [When("I create a brewery with values:")]
    public async Task WhenICreateABreweryWithValues(Table table)
    {
        DataTableRow row = table.Rows[0];
        Guid cityId = Scenario.TryGetValue(CityIdKey, out Guid id) ? id : Guid.NewGuid();

        await CreateBreweryAsync(
            row["BreweryName"] ?? "",
            row["Description"] ?? "",
            row["AddressLine1"] ?? "",
            row["PostalCode"] ?? "",
            cityId
        );
    }

    [When("I create a brewery with a non-existent city")]
    public async Task WhenICreateABreweryWithANonExistentCity()
    {
        await CreateBreweryAsync(
            "Ghost City Brewery",
            "A brewery in a city that does not exist",
            "1 Nowhere St",
            "00000",
            Guid.NewGuid()
        );
    }

    [Given("I have created a brewery")]
    public async Task GivenIHaveCreatedABrewery()
    {
        Guid cityId = Scenario.TryGetValue(CityIdKey, out Guid id)
            ? id
            : throw new InvalidOperationException("city ID not found in scenario");

        await CreateBreweryAsync(
            "Test Brewery",
            "A test brewery",
            "123 Test St",
            "00000",
            cityId
        );

        Scenario
            .TryGetValue<HttpResponseMessage>(ResponseKey, out HttpResponseMessage? response)
            .Should()
            .BeTrue();
        ((int)response!.StatusCode).Should().Be(201, "fixture brewery creation must succeed");

        Scenario.TryGetValue<string>(ResponseBodyKey, out string? responseBody).Should().BeTrue();
        using JsonDocument doc = JsonDocument.Parse(responseBody!);
        JsonElement payload = doc.RootElement.GetProperty("payload");

        Scenario[BreweryPostIdKey] = payload.GetProperty("breweryPostId").GetGuid();
        Scenario[BreweryRowVersionKey] = payload.GetProperty("rowVersion").GetString()
            ?? throw new InvalidOperationException("rowVersion missing from created brewery");
    }

    private Guid GetCreatedBreweryPostId()
    {
        return Scenario.TryGetValue(BreweryPostIdKey, out Guid id)
            ? id
            : throw new InvalidOperationException("brewery post ID not found in scenario");
    }

    [When("I retrieve the brewery by ID")]
    public async Task WhenIRetrieveTheBreweryById()
    {
        HttpRequestMessage requestMessage = NewAuthenticatedRequest(
            HttpMethod.Get,
            $"/api/brewery/{GetCreatedBreweryPostId()}"
        );
        await SendAsync(requestMessage);
    }

    [When("I retrieve a brewery by a non-existent ID")]
    public async Task WhenIRetrieveABreweryByANonExistentId()
    {
        HttpRequestMessage requestMessage = NewAuthenticatedRequest(
            HttpMethod.Get,
            $"/api/brewery/{Guid.NewGuid()}"
        );
        await SendAsync(requestMessage);
    }

    [When("I update the brewery with values:")]
    public async Task WhenIUpdateTheBreweryWithValues(Table table)
    {
        DataTableRow row = table.Rows[0];
        Guid breweryPostId = GetCreatedBreweryPostId();
        string rowVersion = Scenario.TryGetValue<string>(BreweryRowVersionKey, out string? rv)
            ? rv
            : throw new InvalidOperationException("row version not found in scenario");

        var updateData = new
        {
            breweryPostId,
            rowVersion,
            breweryName = row["BreweryName"] ?? "",
            description = row["Description"] ?? "",
            location = (object?)null,
        };

        HttpRequestMessage requestMessage = NewAuthenticatedRequest(
            HttpMethod.Put,
            $"/api/brewery/{breweryPostId}"
        );
        requestMessage.Content = new StringContent(
            JsonSerializer.Serialize(updateData),
            Encoding.UTF8,
            "application/json"
        );

        await SendAsync(requestMessage);
    }

    [When("I update a non-existent brewery")]
    public async Task WhenIUpdateANonExistentBrewery()
    {
        Guid breweryPostId = Guid.NewGuid();
        var updateData = new
        {
            breweryPostId,
            rowVersion = Convert.ToBase64String([0x00, 0x00, 0x00, 0x00]),
            breweryName = "Nonexistent",
            description = "Nonexistent",
            location = (object?)null,
        };

        HttpRequestMessage requestMessage = NewAuthenticatedRequest(
            HttpMethod.Put,
            $"/api/brewery/{breweryPostId}"
        );
        requestMessage.Content = new StringContent(
            JsonSerializer.Serialize(updateData),
            Encoding.UTF8,
            "application/json"
        );

        await SendAsync(requestMessage);
    }

    [When("I delete the brewery")]
    public async Task WhenIDeleteTheBrewery()
    {
        HttpRequestMessage requestMessage = NewAuthenticatedRequest(
            HttpMethod.Delete,
            $"/api/brewery/{GetCreatedBreweryPostId()}"
        );
        await SendAsync(requestMessage);
    }

    [When("I delete a non-existent brewery")]
    public async Task WhenIDeleteANonExistentBrewery()
    {
        HttpRequestMessage requestMessage = NewAuthenticatedRequest(
            HttpMethod.Delete,
            $"/api/brewery/{Guid.NewGuid()}"
        );
        await SendAsync(requestMessage);
    }

    [Given("I am logged in as a different user")]
    public async Task GivenIAmLoggedInAsADifferentUser()
    {
        HttpClient client = GetClient();
        string suffix = Guid.NewGuid().ToString("N")[..8];
        var registrationData = new
        {
            username = $"otheruser-{suffix}",
            firstName = "Other",
            lastName = "User",
            email = $"otheruser-{suffix}@example.com",
            dateOfBirth = "1990-01-01",
            password = "Password1!",
        };

        HttpRequestMessage requestMessage = new(HttpMethod.Post, "/api/auth/register")
        {
            Content = new StringContent(
                JsonSerializer.Serialize(registrationData),
                Encoding.UTF8,
                "application/json"
            ),
        };

        HttpResponseMessage response = await client.SendAsync(requestMessage);
        response.EnsureSuccessStatusCode();
        string responseBody = await response.Content.ReadAsStringAsync();

        using JsonDocument doc = JsonDocument.Parse(responseBody);
        JsonElement payload = doc.RootElement.GetProperty("payload");
        string accessToken =
            (
                payload.TryGetProperty("accessToken", out JsonElement tokenElem)
                    ? tokenElem.GetString()
                    : null
            ) ?? throw new InvalidOperationException("accessToken missing from registration payload");

        Scenario[AccessTokenKey] = accessToken;
    }

    [Then("retrieving the brewery by ID should now return HTTP status {int}")]
    public async Task ThenRetrievingTheBreweryByIdShouldNowReturnHttpStatus(int expectedCode)
    {
        HttpRequestMessage requestMessage = NewAuthenticatedRequest(
            HttpMethod.Get,
            $"/api/brewery/{GetCreatedBreweryPostId()}"
        );
        await SendAsync(requestMessage);

        Scenario
            .TryGetValue<HttpResponseMessage>(ResponseKey, out HttpResponseMessage? response)
            .Should()
            .BeTrue();
        ((int)response!.StatusCode).Should().Be(expectedCode);
    }
}
