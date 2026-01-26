CREATE OR ALTER PROCEDURE usp_GetUserAccountByEmail(
    @Email VARCHAR(128)
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
    WHERE Email = @Email;
END;
