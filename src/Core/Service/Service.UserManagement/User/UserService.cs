using Domain.Entities;
using Infrastructure.Repository.UserAccount;

namespace Service.UserManagement.User;

public class UserService(IUserAccountRepository repository) : IUserService
{
    public async Task<IEnumerable<UserAccount>> GetAllAsync(int? limit = null, int? offset = null)
    {
        return await repository.GetAllAsync(limit, offset);
    }

    public async Task<UserAccount?> GetByIdAsync(Guid id)
    {
        return await repository.GetByIdAsync(id);
    }

    public async Task UpdateAsync(UserAccount userAccount)
    {
        await repository.UpdateAsync(userAccount);
    }
}
