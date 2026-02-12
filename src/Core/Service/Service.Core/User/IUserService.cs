using Domain.Entities;

namespace Service.Core.User;

public interface IUserService
{
    Task<IEnumerable<UserAccount>> GetAllAsync(int? limit = null, int? offset = null);
    Task<UserAccount?> GetByIdAsync(Guid id);

    Task UpdateAsync(UserAccount userAccount);
}
