using DataAccessLayer.Entities;
using DataAccessLayer.Repositories;

namespace BusinessLayer.Services
{
    public class UserService(IUserAccountRepository repository) : IUserService
    {
        public async Task<IEnumerable<UserAccount>> GetAllAsync(int? limit = null, int? offset = null)
        {
            return await repository.GetAll(limit, offset);
        }

        public async Task<UserAccount?> GetByIdAsync(Guid id)
        {
            return await repository.GetById(id);
        }
    }
}
