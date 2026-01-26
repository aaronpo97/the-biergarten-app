using DataAccessLayer.Entities;

namespace DataAccessLayer.Repositories
{
    public interface IUserAccountRepository
    {
        Task Add(UserAccount userAccount);
        Task<UserAccount?> GetById(Guid id);
        Task<IEnumerable<UserAccount>> GetAll(int? limit, int? offset);
        Task Update(UserAccount userAccount);
        Task Delete(Guid id);
        Task<UserAccount?> GetByUsername(string username);
        Task<UserAccount?> GetByEmail(string email);
    }
}
