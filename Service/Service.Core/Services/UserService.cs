using DataAccessLayer.Entities;
using DataAccessLayer.Repositories;
using DataAccessLayer.Repositories.UserAccount;

namespace BusinessLayer.Services
{
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

        public async Task AddAsync(UserAccount userAccount)
        {
            await repository.AddAsync(userAccount);
        }

        public async Task UpdateAsync(UserAccount userAccount)
        {
            await repository.UpdateAsync(userAccount);
        }
    }
}
