using DataAccessLayer.Entities;

public interface IUserCredentialRepository
{
    Task RotateCredentialAsync(Guid userAccountId, UserCredential credential);
    Task<UserCredential?> GetActiveCredentialByUserAccountIdAsync(Guid userAccountId);
    Task InvalidateCredentialsByUserAccountIdAsync(Guid userAccountId);
}
