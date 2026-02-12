namespace Infrastructure.Repository.UserAccount;

public interface IUserAccountRepository
{
    Task<Domain.Entities.UserAccount?> GetByIdAsync(Guid id);
    Task<IEnumerable<Domain.Entities.UserAccount>> GetAllAsync(
        int? limit,
        int? offset
    );
    Task UpdateAsync(Domain.Entities.UserAccount userAccount);
    Task DeleteAsync(Guid id);
    Task<Domain.Entities.UserAccount?> GetByUsernameAsync(
        string username
    );
    Task<Domain.Entities.UserAccount?> GetByEmailAsync(string email);
}