using Domain.Entities;

namespace Service.Auth;

public interface ILoginService
{
    Task<AuthServiceReturn> LoginAsync(string username, string password);
}
