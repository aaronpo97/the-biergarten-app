using System.Threading.Tasks;
using Domain.Entities;

namespace Service.Auth.Auth;

public interface ILoginService
{
    Task<UserAccount?> LoginAsync(string username, string password);
}
