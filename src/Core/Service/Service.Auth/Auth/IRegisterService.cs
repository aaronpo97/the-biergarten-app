using System.Threading.Tasks;
using Domain.Entities;

namespace Service.Auth.Auth;

public interface IRegisterService
{
    Task<UserAccount> RegisterAsync(UserAccount userAccount, string password);
}
