CREATE OR ALTER PROCEDURE dbo.USP_GetActiveUserCredentialByUserAccountId(
    @UserAccountId UNIQUEIDENTIFIER
)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        UserCredentialId,
        UserAccountId,
        Hash,
        IsRevoked,
        CreatedAt,
        RevokedAt
    FROM dbo.UserCredential
    WHERE UserAccountId = @UserAccountId AND IsRevoked = 0;
END;