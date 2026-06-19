using Domain.Entities;

namespace Service.Auth;

/// <summary>
/// Represents the result of a successful login attempt.
/// </summary>
/// <param name="UserAccount">The authenticated user's account.</param>
/// <param name="RefreshToken">The issued refresh token.</param>
/// <param name="AccessToken">The issued access token.</param>
public record LoginServiceReturn(
    UserAccount UserAccount,
    string RefreshToken,
    string AccessToken
);

/// <summary>
/// Defines the operation for authenticating a user with a username and password.
/// </summary>
public interface ILoginService
{
    /// <summary>
    /// Authenticates a user using their username and password and issues new tokens.
    /// </summary>
    /// <param name="username">The username of the account to authenticate.</param>
    /// <param name="password">The plain-text password to verify against the stored credential.</param>
    /// <returns>A <see cref="LoginServiceReturn"/> containing the authenticated user and issued tokens.</returns>
    Task<LoginServiceReturn> LoginAsync(string username, string password);
}
