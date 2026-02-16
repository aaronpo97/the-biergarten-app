using Domain.Entities;

namespace Service.Auth;

public interface ILoginService
{
    Task<LoginServiceReturn> LoginAsync(string username, string password);
}
