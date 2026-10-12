using System.Text.Json.Serialization;

namespace Domain.Entities;

public sealed class UserAccount
{
    // PK
    public Guid UserAccountId { get; set; }

    // Attributes
    public string Username { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public DateTime DateOfBirth { get; set; }

    // Audit Fields
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public byte[]? RowVersion { get; set; }

    // Navigation properties
    public UserCredential? UserCredential { get; set; }
    public UserProfile? UserProfile { get; set; }

    // GET /api/user/authenticated serializes this entity directly, and the avatar graph carries the
    // storage key and uploader of the underlying Photo. Clients read the avatar from
    // PublicUserProfileDto.AvatarUrl, which is a signed URL, so keep this one out of the response.
    [JsonIgnore]
    public UserAvatar? UserAvatar { get; set; }
}
