

namespace DataAccessLayer.Repositories.UserAccount
{
    public interface IUserAccountRepository
    {
        Task AddAsync(Entities.UserAccount userAccount);
        Task<Entities.UserAccount?> GetByIdAsync(Guid id);
        Task<IEnumerable<Entities.UserAccount>> GetAllAsync(int? limit, int? offset);
        Task UpdateAsync(Entities.UserAccount userAccount);
        Task DeleteAsync(Guid id);
        Task<Entities.UserAccount?> GetByUsernameAsync(string username);
        Task<Entities.UserAccount?> GetByEmailAsync(string email);
    }
}
