CREATE OR ALTER PROCEDURE dbo.USP_CreateCountry(
    @CountryName NVARCHAR(100),
    @ISO3166_1 NVARCHAR(2)
)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;
    BEGIN TRANSACTION;

    IF EXISTS (SELECT 1
    FROM dbo.Country
    WHERE ISO3166_1 = @ISO3166_1)
        THROW 50001, 'Country already exists', 1;

    INSERT INTO dbo.Country
        (CountryName, ISO3166_1)
    VALUES
        (@CountryName, @ISO3166_1);
    COMMIT TRANSACTION;
END;
