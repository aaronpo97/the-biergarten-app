using Domain.Entities;

namespace Service.Auth;

public record RegisterServiceReturn
{
    public bool IsAuthenticated { get; init; } = false;
    public bool EmailSent { get; init; } = false;
    public UserAccount UserAccount { get; init; }
    public string AccessToken { get; init; } = string.Empty;
    public string RefreshToken { get; init; } = string.Empty;

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

    public RegisterServiceReturn(UserAccount userAccount)
    {
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
