namespace DataAccessLayer.Entities;

public class UserVerification
{
    public Guid UserVerificationId { get; set; }
    public Guid UserAccountId { get; set; }
    public DateTime VerificationDateTime { get; set; }
    public byte[]? Timer { get; set; }
}
