CREATE OR ALTER FUNCTION dbo.UDF_GetStateProvinceIdByCode
(
    @StateProvinceCode NVARCHAR(6)
)
RETURNS UNIQUEIDENTIFIER
AS
BEGIN
    DECLARE @StateProvinceId UNIQUEIDENTIFIER;
    SELECT @StateProvinceId = StateProvinceID
    FROM dbo.StateProvince
    WHERE ISO3616_2 = @StateProvinceCode;
    RETURN @StateProvinceId;
END;
