CREATE OR ALTER PROCEDURE dbo.USP_CreateCity(
    @CityName NVARCHAR(100),
    @StateProvinceCode NVARCHAR(6)
)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRANSACTION
        DECLARE @StateProvinceId UNIQUEIDENTIFIER = dbo.UDF_GetStateProvinceIdByCode(@StateProvinceCode);
        IF @StateProvinceId IS NULL
            BEGIN
                THROW 50001, 'State/province does not exist', 1;
            END

        IF EXISTS (SELECT 1
                   FROM dbo.City
                   WHERE CityName = @CityName
                     AND StateProvinceID = @StateProvinceId)
            BEGIN

                THROW 50002, 'City already exists.', 1;
            END

        INSERT INTO dbo.City
            (StateProvinceID, CityName)
        VALUES (@StateProvinceId, @CityName);
    COMMIT TRANSACTION
END;
