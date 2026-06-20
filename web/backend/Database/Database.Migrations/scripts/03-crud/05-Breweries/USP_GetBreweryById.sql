CREATE
OR
ALTER PROCEDURE dbo.USP_GetBreweryById @BreweryPostID UNIQUEIDENTIFIER
    AS
BEGIN
SELECT *
FROM BreweryPost bp
         INNER JOIN BreweryPostLocation bpl
                    ON bp.BreweryPostID = bpl.BreweryPostID
WHERE bp.BreweryPostID = @BreweryPostID;
END