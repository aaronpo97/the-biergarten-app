using Domain.Entities;

namespace Service.Auth;

public record RegisterServiceReturn
{
    public bool IsAuthenticated { get; init; }
    public bool EmailSent { get; init; }
    public UserAccount UserAccount { get; init; }
    public string AccessToken { get; init; } = string.Empty;
    public string RefreshToken { get; init; } = string.Empty;

    public RegisterServiceReturn(UserAccount userAccount, string accessToken, string refreshToken, bool emailSent)
    {
        IsAuthenticated = true;
        UserAccount = userAccount;
        AccessToken = accessToken;
        RefreshToken = refreshToken;
        EmailSent = true;
    }

    public RegisterServiceReturn(UserAccount userAccount)
    {
        IsAuthenticated = false;
        UserAccount = userAccount;
    }
}

public interface IRegisterService
{
    Task<RegisterServiceReturn> RegisterAsync(
        UserAccount userAccount,
        string password
    );
}