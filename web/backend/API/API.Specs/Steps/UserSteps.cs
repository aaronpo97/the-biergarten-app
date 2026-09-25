using System.Text.Json;
using FluentAssertions;
using Reqnroll;

namespace API.Specs.Steps;

[Binding]
public class UserSteps(ScenarioContext scenario) : ApiStepsBase(scenario)
{
    private const string AccessTokenKey = "accessToken";
    private const string RegisteredUserIdKey = "registeredUserId";
    private const string RegisteredUsernameKey = "registeredUsername";

    private async Task SendAsync(HttpRequestMessage requestMessage)
    {
        HttpClient client = GetClient();
        HttpResponseMessage response = await client.SendAsync(requestMessage);
        string responseBody = await response.Content.ReadAsStringAsync();

        Scenario[ResponseKey] = response;
        Scenario[ResponseBodyKey] = responseBody;
    }

    private HttpRequestMessage NewAuthenticatedRequest(HttpMethod method, string url)
    {
        HttpRequestMessage requestMessage = new(method, url);
        if (Scenario.TryGetValue<string>(AccessTokenKey, out string? accessToken))
            requestMessage.Headers.Add("Authorization", $"Bearer {accessToken}");
        return requestMessage;
    }

    private Guid GetRegisteredUserId()
    {
        return Scenario.TryGetValue(RegisteredUserIdKey, out Guid id)
            ? id
            : throw new InvalidOperationException("registered user ID not found in scenario");
    }

    [When("I retrieve the public profile by ID")]
    public async Task WhenIRetrieveThePublicProfileById()
    {
        await SendAsync(NewAuthenticatedRequest(HttpMethod.Get, $"/api/user/{GetRegisteredUserId()}/profile"));
    }

    [When("I retrieve the public profile by ID without authentication")]
    public async Task WhenIRetrieveThePublicProfileByIdWithoutAuthentication()
    {
        await SendAsync(new HttpRequestMessage(HttpMethod.Get, $"/api/user/{GetRegisteredUserId()}/profile"));
    }

    [When("I retrieve the public profile by a non-existent ID")]
    public async Task WhenIRetrieveThePublicProfileByANonExistentId()
    {
        await SendAsync(NewAuthenticatedRequest(HttpMethod.Get, $"/api/user/{Guid.NewGuid()}/profile"));
    }

    [When("I retrieve my own account without authentication")]
    public async Task WhenIRetrieveMyOwnAccountWithoutAuthentication()
    {
        await SendAsync(new HttpRequestMessage(HttpMethod.Get, "/api/user/authenticated"));
    }

    [When("I list user accounts without authentication")]
    public async Task WhenIListUserAccountsWithoutAuthentication()
    {
        await SendAsync(new HttpRequestMessage(HttpMethod.Get, "/api/user"));
    }

    [When("I list user accounts")]
    public async Task WhenIListUserAccounts()
    {
        await SendAsync(NewAuthenticatedRequest(HttpMethod.Get, "/api/user"));
    }

    [When("I retrieve my own account")]
    public async Task WhenIRetrieveMyOwnAccount()
    {
        await SendAsync(NewAuthenticatedRequest(HttpMethod.Get, "/api/user/authenticated"));
    }

    [Then("the public profile response should match the registered account")]
    public void ThenThePublicProfileResponseShouldMatchTheRegisteredAccount()
    {
        Scenario.TryGetValue<string>(ResponseBodyKey, out string? responseBody).Should().BeTrue();
        string? username = Scenario.TryGetValue<string>(RegisteredUsernameKey, out string? u)
            ? u
            : throw new InvalidOperationException("registered username not found in scenario");

        using JsonDocument doc = JsonDocument.Parse(responseBody!);
        JsonElement root = doc.RootElement;

        root.GetProperty("userAccountId").GetGuid().Should().Be(GetRegisteredUserId());
        root.GetProperty("username").GetString().Should().Be(username);
    }

    [Then("the account response should be for a different account than the registered one")]
    public void ThenTheAccountResponseShouldBeForADifferentAccountThanTheRegisteredOne()
    {
        Scenario.TryGetValue<string>(ResponseBodyKey, out string? responseBody).Should().BeTrue();

        using JsonDocument doc = JsonDocument.Parse(responseBody!);
        doc.RootElement.GetProperty("userAccountId")
            .GetGuid()
            .Should()
            .NotBe(GetRegisteredUserId());
    }
}
