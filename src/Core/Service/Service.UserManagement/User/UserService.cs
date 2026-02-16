using Domain.Entities;
using Domain.Exceptions;
using Infrastructure.Repository.UserAccount;

namespace Service.UserManagement.User;

public class UserService(IUserAccountRepository repository) : IUserService
{
    public async Task<IEnumerable<UserAccount>> GetAllAsync(
        int? limit = null,
        int? offset = null
    )
    {
        return await repository.GetAllAsync(limit, offset);
    }

    public async Task<UserAccount> GetByIdAsync(Guid id)
    {
        var user = await repository.GetByIdAsync(id);
        if (user is null)
            throw new NotFoundException($"User with ID {id} not found");
        return user;
    }

    public async Task UpdateAsync(UserAccount userAccount)
    {
        await repository.UpdateAsync(userAccount);
    }
}
