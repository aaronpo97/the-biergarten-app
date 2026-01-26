CREATE OR ALTER PROCEDURE dbo.USP_CreateCountry
(
    @CountryName NVARCHAR(100),
    @ISO3616_1 NVARCHAR(2)
)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    IF EXISTS (
        SELECT 1
        FROM dbo.Country
        WHERE ISO3616_1 = @ISO3616_1
    )
        RETURN;

    INSERT INTO dbo.Country
        (CountryName, ISO3616_1)
    VALUES
        (@CountryName, @ISO3616_1);
END;
