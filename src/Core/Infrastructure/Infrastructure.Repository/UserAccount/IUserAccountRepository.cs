namespace Infrastructure.Repository.UserAccount;

public interface IUserAccountRepository
{
    Task<Domain.Core.Entities.UserAccount?> GetByIdAsync(Guid id);
    Task<IEnumerable<Domain.Core.Entities.UserAccount>> GetAllAsync(
        int? limit,
        int? offset
    );
    Task UpdateAsync(Domain.Core.Entities.UserAccount userAccount);
    Task DeleteAsync(Guid id);
    Task<Domain.Core.Entities.UserAccount?> GetByUsernameAsync(
        string username
    );
    Task<Domain.Core.Entities.UserAccount?> GetByEmailAsync(string email);
}