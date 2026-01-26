using DataAccessLayer.Entities;

namespace BusinessLayer.Services
{
    public interface IUserService
    {
        Task<IEnumerable<UserAccount>> GetAllAsync(int? limit = null, int? offset = null);
        Task<UserAccount?> GetByIdAsync(Guid id);

        Task AddAsync(UserAccount userAccount);

        Task UpdateAsync(UserAccount userAccount);
    }
}
