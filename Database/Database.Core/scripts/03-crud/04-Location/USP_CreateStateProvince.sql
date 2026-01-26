CREATE OR ALTER PROCEDURE dbo.USP_CreateStateProvince
(
    @StateProvinceName NVARCHAR(100),
    @ISO3616_2 NVARCHAR(6),
    @CountryCode NVARCHAR(2)
)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    IF EXISTS (
        SELECT 1
        FROM dbo.StateProvince
        WHERE ISO3616_2 = @ISO3616_2
    )
        RETURN;

    DECLARE @CountryId UNIQUEIDENTIFIER = dbo.UDF_GetCountryIdByCode(@CountryCode);
    IF @CountryId IS NULL
    BEGIN
        RAISERROR('Country not found for code.', 16, 1);
        RETURN;
    END

    INSERT INTO dbo.StateProvince
        (StateProvinceName, ISO3616_2, CountryID)
    VALUES
        (@StateProvinceName, @ISO3616_2, @CountryId);
END;
