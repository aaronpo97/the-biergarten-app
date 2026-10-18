using System.Text.Json;
using API.Specs.Mocks;
using Database.Connection;
using Features.ImageUploads.Services;
using Features.Users.Commands.Profile.UploadAvatar;
using Features.Users.Repository;
using FluentAssertions;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.DependencyInjection;
using Reqnroll;

namespace API.Specs.Steps;

[Binding]
public class UserSteps(ScenarioContext scenario) : ApiStepsBase(scenario)
{
    private const string AccessTokenKey = "accessToken";
    private const string RegisteredUserIdKey = "registeredUserId";
    private const string RegisteredUsernameKey = "registeredUsername";
    private const string CurrentAvatarKeyKey = "currentAvatarKey";
    private const string PreviousAvatarKeyKey = "previousAvatarKey";
    private const string BiographyKey = "biography";

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

    /// <summary>
    ///     Uploads an avatar and records the object key the storage provider actually received, rather
    ///     than re-deriving the key template the handler uses.
    /// </summary>
    private async Task UploadAvatarAsync()
    {
        Guid userId = GetRegisteredUserId();

        using IServiceScope scope = GetFactory().Services.CreateScope();
        IMediator mediator = scope.ServiceProvider.GetRequiredService<IMediator>();
        await mediator.Send(new UploadAvatarCommand(userId, CreateAvatarFile()));

        if (Scenario.TryGetValue<string>(CurrentAvatarKeyKey, out string? existing))
            Scenario[PreviousAvatarKeyKey] = existing;

        Scenario[CurrentAvatarKeyKey] = GetStorageProvider().LastUploadedKey;
    }

    private MockFileStorageProvider GetStorageProvider()
    {
        return (MockFileStorageProvider)
            GetFactory().Services.GetRequiredService<IFileStorageProvider>();
    }

    private string GetCurrentAvatarKey()
    {
        return Scenario.TryGetValue(CurrentAvatarKeyKey, out string? key) && key is not null
            ? key
            : throw new InvalidOperationException("no avatar has been uploaded in this scenario");
    }

    private string GetPreviousAvatarKey()
    {
        return Scenario.TryGetValue(PreviousAvatarKeyKey, out string? key) && key is not null
            ? key
            : throw new InvalidOperationException(
                "only one avatar has been uploaded in this scenario"
            );
    }

    /// <summary>
    ///     Asserts that <paramref name="avatarUrl" /> is something a browser can fetch -- an absolute
    ///     HTTP(S) URL -- pointing at the object stored under <paramref name="expectedKey" />. A bare
    ///     storage key would resolve against the page's own origin, so the shape is the contract here,
    ///     not just the value.
    /// </summary>
    private static Uri AssertFetchableUrl(string? avatarUrl, string expectedKey)
    {
        avatarUrl.Should().NotBeNullOrWhiteSpace();

        Uri.TryCreate(avatarUrl, UriKind.Absolute, out Uri? uri)
            .Should()
            .BeTrue("avatarUrl must be an absolute URL, but was '{0}'", avatarUrl);
        uri!.Scheme.Should().BeOneOf("http", "https");
        uri.AbsolutePath.Should().EndWith(expectedKey, "the URL must address the uploaded object");

        return uri;
    }

    private string GetAvatarUrlFromResponse()
    {
        Scenario.TryGetValue<string>(ResponseBodyKey, out string? responseBody).Should().BeTrue();

        using JsonDocument doc = JsonDocument.Parse(responseBody!);
        return doc.RootElement.GetProperty("avatarUrl").GetString()!;
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

    /// <summary>
    ///     Pushes the active avatar's ValidFrom ahead of the clock so that closing it at the current
    ///     time would land before ValidFrom, which the avatar range check rejects.
    /// </summary>
    [Given("my current avatar became active in the future")]
    public async Task GivenMyCurrentAvatarBecameActiveInTheFuture()
    {
        ISqlConnectionFactory factory = GetFactory().Services.GetRequiredService<ISqlConnectionFactory>();
        await using SqlConnection connection = factory.CreateConnection();
        await connection.OpenAsync();

        await using SqlCommand command = connection.CreateCommand();
        command.CommandText = """
            UPDATE av
            SET ValidFrom = DATEADD(HOUR, 1, SYSUTCDATETIME())
            FROM Social.UserAvatar av
            JOIN Social.UserProfile up ON up.UserProfileID = av.UserProfileID
            WHERE up.UserAccountID = @UserAccountId AND av.ValidTo IS NULL
            """;
        command.Parameters.AddWithValue("@UserAccountId", GetRegisteredUserId());

        (await command.ExecuteNonQueryAsync()).Should().Be(1);
    }

    /// <summary>
    ///     Writes the biography straight through the repository: registration creates the profile row
    ///     with an empty biography, and no endpoint edits it yet.
    /// </summary>
    [Given("I have set my biography to {string}")]
    public async Task GivenIHaveSetMyBiographyTo(string biography)
    {
        using IServiceScope scope = GetFactory().Services.CreateScope();
        IUserProfileRepository profiles =
            scope.ServiceProvider.GetRequiredService<IUserProfileRepository>();

        await profiles.UpdateBiographyAsync(
            GetRegisteredUserId(),
            biography,
            CancellationToken.None
        );

        Scenario[BiographyKey] = biography;
    }

    [Then("the public profile response should carry my current avatar")]
    public void ThenThePublicProfileResponseShouldCarryMyCurrentAvatar()
    {
        AssertFetchableUrl(GetAvatarUrlFromResponse(), GetCurrentAvatarKey());
    }

    [Then("the public profile response should not carry my previous avatar")]
    public void ThenThePublicProfileResponseShouldNotCarryMyPreviousAvatar()
    {
        Uri uri = AssertFetchableUrl(GetAvatarUrlFromResponse(), GetCurrentAvatarKey());
        uri.AbsolutePath.Should().NotContain(GetPreviousAvatarKey());
    }

    [Then("my listed account should carry my current avatar")]
    public void ThenMyListedAccountShouldCarryMyCurrentAvatar()
    {
        AssertFetchableUrl(
            GetMyListedAccount().GetProperty("avatarUrl").GetString(),
            GetCurrentAvatarKey()
        );
    }

    [Then("my listed account should carry my biography")]
    public void ThenMyListedAccountShouldCarryMyBiography()
    {
        string expected =
            Scenario.TryGetValue(BiographyKey, out string? biography) && biography is not null
                ? biography
                : throw new InvalidOperationException("no biography was set in this scenario");

        GetMyListedAccount().GetProperty("biography").GetString().Should().Be(expected);
    }

    /// <summary>Finds the registered account in a listing response.</summary>
    private JsonElement GetMyListedAccount()
    {
        Scenario.TryGetValue<string>(ResponseBodyKey, out string? responseBody).Should().BeTrue();

        using JsonDocument doc = JsonDocument.Parse(responseBody!);
        doc.RootElement.ValueKind.Should().Be(JsonValueKind.Array);

        return doc
            .RootElement.EnumerateArray()
            .Should()
            .ContainSingle(item =>
                item.GetProperty("userAccountId").GetGuid() == GetRegisteredUserId()
            )
            .Subject.Clone();
    }

    [When("I retrieve the public profile by ID")]
    public async Task WhenIRetrieveThePublicProfileById()
    {
        await SendAsync(
            NewAuthenticatedRequest(HttpMethod.Get, $"/api/user/{GetRegisteredUserId()}/profile")
        );
    }

    [When("I retrieve the public profile by ID without authentication")]
    public async Task WhenIRetrieveThePublicProfileByIdWithoutAuthentication()
    {
        await SendAsync(
            new HttpRequestMessage(HttpMethod.Get, $"/api/user/{GetRegisteredUserId()}/profile")
        );
    }

    [When("I retrieve the public profile by a non-existent ID")]
    public async Task WhenIRetrieveThePublicProfileByANonExistentId()
    {
        await SendAsync(
            NewAuthenticatedRequest(HttpMethod.Get, $"/api/user/{Guid.NewGuid()}/profile")
        );
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
