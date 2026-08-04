namespace Domain.Entities;

public class UserCredential
{
    public Guid UserCredentialId { get; set; }
    public Guid UserAccountId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime Expiry { get; set; }
    public string Hash { get; set; } = string.Empty;
    public byte[]? Timer { get; set; }
    public UserAccount UserAccount { get; set; } = null!;
}
