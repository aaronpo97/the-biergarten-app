
CREATE OR ALTER PROCEDURE usp_GetUserAccountByUsername
(
    @Username VARCHAR(64)
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
    WHERE Username = @Username;
END;
