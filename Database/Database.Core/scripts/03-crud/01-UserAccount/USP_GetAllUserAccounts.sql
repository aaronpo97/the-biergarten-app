
CREATE OR ALTER PROCEDURE usp_GetAllUserAccounts
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
    FROM dbo.UserAccount;
END;
