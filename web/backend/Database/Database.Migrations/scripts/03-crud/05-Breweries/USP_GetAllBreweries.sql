CREATE
OR
ALTER PROCEDURE dbo.USP_GetAllBreweries(
    @Limit INT = NULL,
    @Offset INT = NULL
    )
    AS
BEGIN
    SET
NOCOUNT ON;

SELECT bp.BreweryPostID,
       bp.PostedByID,
       bp.BreweryName,
       bp.Description,
       bp.CreatedAt,
       bp.UpdatedAt,
       bp.Timer,
       bpl.BreweryPostLocationID,
       bpl.CityID,
       bpl.AddressLine1,
       bpl.AddressLine2,
       bpl.PostalCode,
       bpl.Coordinates
FROM dbo.BreweryPost bp
         LEFT JOIN dbo.BreweryPostLocation bpl
                   ON bp.BreweryPostID = bpl.BreweryPostID
ORDER BY bp.CreatedAt DESC
OFFSET ISNULL(@Offset, 0) ROWS FETCH NEXT ISNULL(@Limit, 2147483647) ROWS ONLY;
END
