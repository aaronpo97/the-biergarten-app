namespace Service.Core.Password;

public interface IPasswordService
{
    public string Hash(string password);
    public bool Verify(string password, string stored);
}
