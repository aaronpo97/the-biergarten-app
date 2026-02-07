CREATE OR ALTER FUNCTION dbo.UDF_GetCountryIdByCode
(
    @CountryCode NVARCHAR(2)
)
RETURNS UNIQUEIDENTIFIER
AS
BEGIN
    DECLARE @CountryId UNIQUEIDENTIFIER;

    SELECT @CountryId = CountryID
    FROM dbo.Country
    WHERE ISO3616_1 = @CountryCode;

    RETURN @CountryId;
END;
