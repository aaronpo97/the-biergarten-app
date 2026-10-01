using System.Text.Json;
using Features.Users.Commands.Profile.UploadAvatar;
using FluentAssertions;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Reqnroll;

namespace API.Specs.Steps;

[Binding]
public class UserSteps(ScenarioContext scenario) : ApiStepsBase(scenario)
{
    private const string AccessTokenKey = "accessToken";
    private const string RegisteredUserIdKey = "registeredUserId";
    private const string RegisteredUsernameKey = "registeredUsername";
    private const string CurrentAvatarUrlKey = "currentAvatarUrl";
    private const string PreviousAvatarUrlKey = "previousAvatarUrl";

    private static readonly byte[] PngSignature = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];

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

    /// <summary>
    ///     Builds the smallest upload the photo validator accepts: a PNG signature padded out to the
    ///     1 KiB minimum.
    /// </summary>
    private static IFormFile CreateAvatarFile()
    {
        byte[] content = new byte[2048];
        PngSignature.CopyTo(content, 0);
        MemoryStream stream = new(content);

        return new FormFile(stream, 0, content.Length, "file", "avatar.png")
        {
            Headers = new HeaderDictionary { ["Content-Type"] = "image/png" },
        };
    }

    private async Task UploadAvatarAsync()
    {
        Guid userId = GetRegisteredUserId();

        using IServiceScope scope = GetFactory().Services.CreateScope();
        IMediator mediator = scope.ServiceProvider.GetRequiredService<IMediator>();
        Guid photoId = await mediator.Send(new UploadAvatarCommand(userId, CreateAvatarFile()));

        if (Scenario.TryGetValue<string>(CurrentAvatarUrlKey, out string? existing))
            Scenario[PreviousAvatarUrlKey] = existing;

        Scenario[CurrentAvatarUrlKey] = $"avatars/{userId}/{photoId}";
    }

    private string GetCurrentAvatarUrl()
    {
        return Scenario.TryGetValue(CurrentAvatarUrlKey, out string? url) && url is not null
            ? url
            : throw new InvalidOperationException("no avatar has been uploaded in this scenario");
    }

    private string GetPreviousAvatarUrl()
    {
        return Scenario.TryGetValue(PreviousAvatarUrlKey, out string? url) && url is not null
            ? url
            : throw new InvalidOperationException("only one avatar has been uploaded in this scenario");
    }

    [Given("I have uploaded an avatar")]
    public async Task GivenIHaveUploadedAnAvatar()
    {
        await UploadAvatarAsync();
    }

    [Given("I have uploaded a new avatar, replacing the previous one")]
    public async Task GivenIHaveUploadedANewAvatarReplacingThePreviousOne()
    {
        await UploadAvatarAsync();
    }

    [Then("the public profile response should carry my current avatar")]
    public void ThenThePublicProfileResponseShouldCarryMyCurrentAvatar()
    {
        Scenario.TryGetValue<string>(ResponseBodyKey, out string? responseBody).Should().BeTrue();

        using JsonDocument doc = JsonDocument.Parse(responseBody!);
        doc.RootElement.GetProperty("avatarUrl").GetString().Should().Be(GetCurrentAvatarUrl());
    }

    [Then("the public profile response should not carry my previous avatar")]
    public void ThenThePublicProfileResponseShouldNotCarryMyPreviousAvatar()
    {
        Scenario.TryGetValue<string>(ResponseBodyKey, out string? responseBody).Should().BeTrue();

        using JsonDocument doc = JsonDocument.Parse(responseBody!);
        doc.RootElement.GetProperty("avatarUrl").GetString().Should().NotBe(GetPreviousAvatarUrl());
    }

    [Then("my listed account should carry my current avatar")]
    public void ThenMyListedAccountShouldCarryMyCurrentAvatar()
    {
        Scenario.TryGetValue<string>(ResponseBodyKey, out string? responseBody).Should().BeTrue();

        using JsonDocument doc = JsonDocument.Parse(responseBody!);
        doc.RootElement.ValueKind.Should().Be(JsonValueKind.Array);

        JsonElement listed = doc
            .RootElement.EnumerateArray()
            .Should()
            .ContainSingle(item =>
                item.GetProperty("userAccountId").GetGuid() == GetRegisteredUserId()
            )
            .Subject;

        listed.GetProperty("avatarUrl").GetString().Should().Be(GetCurrentAvatarUrl());
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
