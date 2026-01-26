CREATE OR ALTER PROCEDURE USP_GetUserAccountById(
    @UserAccountId UNIQUEIDENTIFIER
)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT UserAccountID,
           Username,
           FirstName,
           LastName,
           Email,
           CreatedAt,
           UpdatedAt,
           DateOfBirth,
           Timer
    FROM dbo.UserAccount
    WHERE UserAccountID = @UserAccountId;
END
