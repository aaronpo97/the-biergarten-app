using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Database.Connection;
using FluentAssertions;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.DependencyInjection;
using Reqnroll;

namespace API.Specs.Steps;

[Binding]
public class FollowSteps(ScenarioContext scenario) : ApiStepsBase(scenario)
{
    private sealed record Actor(Guid UserAccountId, string AccessToken);

    private static string ActorKey(string name) => $"actor:{name}";

    private Actor GetActor(string name) =>
        Scenario.TryGetValue(ActorKey(name), out Actor? actor) && actor is not null
            ? actor
            : throw new InvalidOperationException($"no user named '{name}' in this scenario");

    private async Task SendAsync(HttpMethod method, string url, string? accessToken)
    {
        HttpRequestMessage request = new(method, url);
        if (accessToken is not null)
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

        HttpResponseMessage response = await GetClient().SendAsync(request);
        Scenario[ResponseKey] = response;
        Scenario[ResponseBodyKey] = await response.Content.ReadAsStringAsync();
    }

    private async Task<int> CountFollowsAsync(Guid followerId, Guid followingId)
    {
        ISqlConnectionFactory factory =
            GetFactory().Services.GetRequiredService<ISqlConnectionFactory>();
        await using SqlConnection connection = factory.CreateConnection();
        await connection.OpenAsync();

        await using SqlCommand command = connection.CreateCommand();
        command.CommandText = """
            SELECT COUNT(*) FROM Social.UserFollow
            WHERE UserAccountID = @FollowerId AND FollowingID = @FollowingId
            """;
        command.Parameters.AddWithValue("@FollowerId", followerId);
        command.Parameters.AddWithValue("@FollowingId", followingId);

        return (int)(await command.ExecuteScalarAsync())!;
    }

    [Given("a registered user {string}")]
    public async Task GivenARegisteredUser(string name)
    {
        string suffix = Guid.NewGuid().ToString("N")[..8];
        var registrationData = new
        {
            username = $"{name}-{suffix}",
            firstName = name,
            lastName = "Tester",
            email = $"{name}-{suffix}@example.com",
            dateOfBirth = "1990-01-01",
            password = "Password1!",
        };

        HttpRequestMessage request = new(HttpMethod.Post, "/api/auth/register")
        {
            Content = new StringContent(
                JsonSerializer.Serialize(registrationData),
                Encoding.UTF8,
                "application/json"
            ),
        };

        HttpResponseMessage response = await GetClient().SendAsync(request);
        response.EnsureSuccessStatusCode();

        using JsonDocument doc = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        JsonElement payload = doc.RootElement.GetProperty("payload");

        Scenario[ActorKey(name)] = new Actor(
            payload.GetProperty("userAccountId").GetGuid(),
            payload.GetProperty("accessToken").GetString()!
        );
    }

    [Given("{string} follows {string}")]
    [When("{string} follows {string}")]
    public async Task WhenFollows(string follower, string target)
    {
        await SendAsync(
            HttpMethod.Put,
            $"/api/user/{GetActor(target).UserAccountId}/follow",
            GetActor(follower).AccessToken
        );
    }

    [When("{string} follows a user that does not exist")]
    public async Task WhenFollowsAUserThatDoesNotExist(string follower)
    {
        await SendAsync(
            HttpMethod.Put,
            $"/api/user/{Guid.NewGuid()}/follow",
            GetActor(follower).AccessToken
        );
    }

    [When("an anonymous visitor follows {string}")]
    public async Task WhenAnAnonymousVisitorFollows(string target)
    {
        await SendAsync(HttpMethod.Put, $"/api/user/{GetActor(target).UserAccountId}/follow", null);
    }

    [When("{string} unfollows {string}")]
    public async Task WhenUnfollows(string follower, string target)
    {
        await SendAsync(
            HttpMethod.Delete,
            $"/api/user/{GetActor(target).UserAccountId}/follow",
            GetActor(follower).AccessToken
        );
    }

    [When("an anonymous visitor unfollows {string}")]
    public async Task WhenAnAnonymousVisitorUnfollows(string target)
    {
        await SendAsync(
            HttpMethod.Delete,
            $"/api/user/{GetActor(target).UserAccountId}/follow",
            null
        );
    }

    [When("{string} deletes their account")]
    public async Task WhenDeletesTheirAccount(string name)
    {
        await SendAsync(HttpMethod.Delete, "/api/auth/account", GetActor(name).AccessToken);
    }

    [Then("{string} should be following {string}")]
    public async Task ThenShouldBeFollowing(string follower, string target)
    {
        (await CountFollowsAsync(GetActor(follower).UserAccountId, GetActor(target).UserAccountId))
            .Should()
            .Be(1);
    }

    [Then("{string} should not be following {string}")]
    public async Task ThenShouldNotBeFollowing(string follower, string target)
    {
        (await CountFollowsAsync(GetActor(follower).UserAccountId, GetActor(target).UserAccountId))
            .Should()
            .Be(0);
    }

    [Then("there should be {int} follow from {string} to {string}")]
    public async Task ThenThereShouldBeFollowFromTo(int count, string follower, string target)
    {
        (await CountFollowsAsync(GetActor(follower).UserAccountId, GetActor(target).UserAccountId))
            .Should()
            .Be(count);
    }
}
