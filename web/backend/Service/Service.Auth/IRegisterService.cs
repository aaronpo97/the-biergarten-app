using Domain.Entities;

namespace Service.Auth;

/// <summary>
/// Represents the result of a user registration attempt.
/// </summary>
public record RegisterServiceReturn
{
    /// <summary>
    /// Gets a value indicating whether tokens were issued for the newly created account.
    /// <c>false</c> when token generation failed, in which case <see cref="AccessToken"/> and
    /// <see cref="RefreshToken"/> are empty.
    /// </summary>
    public bool IsAuthenticated { get; init; } = false;

    /// <summary>
    /// Gets a value indicating whether the registration confirmation email was sent successfully.
    /// </summary>
    public bool EmailSent { get; init; } = false;

    /// <summary>
    /// Gets the user account that was created.
    /// </summary>
    public UserAccount UserAccount { get; init; }

    /// <summary>
    /// Gets the issued access token, or an empty string if authentication was not completed.
    /// </summary>
    public string AccessToken { get; init; } = string.Empty;

    /// <summary>
    /// Gets the issued refresh token, or an empty string if authentication was not completed.
    /// </summary>
    public string RefreshToken { get; init; } = string.Empty;

    /// <summary>
    /// Initializes a new instance representing a successful registration with issued tokens.
    /// </summary>
    /// <param name="userAccount">The newly created user account.</param>
    /// <param name="accessToken">The issued access token.</param>
    /// <param name="refreshToken">The issued refresh token.</param>
    /// <param name="emailSent">Whether the confirmation email was sent successfully.</param>
    public RegisterServiceReturn(
        UserAccount userAccount,
        string accessToken,
        string refreshToken,
        bool emailSent
    )
    {
        IsAuthenticated = true;
        EmailSent = emailSent;
        UserAccount = userAccount;
        AccessToken = accessToken;
        RefreshToken = refreshToken;
    }

    /// <summary>
    /// Initializes a new instance representing a registration where tokens could not be issued.
    /// </summary>
    /// <param name="userAccount">The newly created user account.</param>
    public RegisterServiceReturn(UserAccount userAccount)
    {
        UserAccount = userAccount;
    }
}

/// <summary>
/// Defines the operation for registering a new user account.
/// </summary>
public interface IRegisterService
{
    /// <summary>
    /// Registers a new user account with the given password.
    /// </summary>
    /// <param name="userAccount">The user account details to register.</param>
    /// <param name="password">The plain-text password to hash and store for the new account.</param>
    /// <returns>A <see cref="RegisterServiceReturn"/> describing the outcome of the registration.</returns>
    Task<RegisterServiceReturn> RegisterAsync(
        UserAccount userAccount,
        string password
    );
}