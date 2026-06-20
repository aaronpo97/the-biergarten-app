CREATE
OR
ALTER PROCEDURE dbo.USP_CreateStateProvince(
    @StateProvinceName NVARCHAR(100),
    @ISO3166_2 NVARCHAR(6),
    @CountryCode NVARCHAR(2)
    )
    AS
BEGIN
    SET
NOCOUNT ON;
    SET
XACT_ABORT ON;

    IF
EXISTS (SELECT 1
    FROM dbo.StateProvince
    WHERE ISO3166_2 = @ISO3166_2)
        RETURN;

    DECLARE
@CountryId UNIQUEIDENTIFIER = dbo.UDF_GetCountryIdByCode(@CountryCode);
    IF
@CountryId IS NULL
BEGIN
    THROW
50001, 'Country does not exist', 1;

END

INSERT INTO dbo.StateProvince
    (StateProvinceName, ISO3166_2, CountryID)
VALUES (@StateProvinceName, @ISO3166_2, @CountryId);
END;
