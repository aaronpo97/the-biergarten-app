namespace Infrastructure.PasswordHashing;

public interface IPasswordInfra
{
    public string Hash(string password);
    public bool Verify(string password, string stored);
}
