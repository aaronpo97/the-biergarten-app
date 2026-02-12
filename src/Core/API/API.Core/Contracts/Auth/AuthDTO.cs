namespace API.Core.Contracts.Auth;

public record UserDTO(Guid UserAccountId, string Username);
public record AuthPayload(UserDTO User, string AccessToken, DateTime CreatedAt, DateTime ExpiresAt);
