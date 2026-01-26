namespace DataAccessLayer.Entities;

public class UserAccount
{
    public Guid UserAccountId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public DateTime DateOfBirth { get; set; }
    public byte[]? Timer { get; set; }
}
