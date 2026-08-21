CREATE OR ALTER PROCEDURE dbo.USP_DeleteBrewery @BreweryPostID UNIQUEIDENTIFIER
AS
BEGIN
    SET
        NOCOUNT ON;

    IF
        NOT EXISTS (SELECT 1
                    FROM dbo.BreweryPost
                    WHERE BreweryPostID = @BreweryPostID)
        THROW 50404, 'Brewery not found.', 1;

    -- BreweryPostLocation and BreweryPostPhoto cascade-delete with their parent BreweryPost.
    DELETE
    FROM dbo.BreweryPost
    WHERE BreweryPostID = @BreweryPostID;
END
