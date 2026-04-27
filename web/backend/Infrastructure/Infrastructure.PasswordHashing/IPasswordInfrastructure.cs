namespace Infrastructure.PasswordHashing;

public interface IPasswordInfrastructure
{
    public string Hash(string password);
    public bool Verify(string password, string stored);
}
