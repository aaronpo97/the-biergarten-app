CREATE OR ALTER PROCEDURE dbo.USP_UpdateBrewery(
    @BreweryPostID UNIQUEIDENTIFIER,
    @BreweryName NVARCHAR(256),
    @Description NVARCHAR(512),
    @BreweryPostLocationID UNIQUEIDENTIFIER = NULL,
    @CityID UNIQUEIDENTIFIER = NULL,
    @AddressLine1 NVARCHAR(256) = NULL,
    @AddressLine2 NVARCHAR(256) = NULL,
    @PostalCode NVARCHAR(20) = NULL,
    @Coordinates GEOGRAPHY = NULL
)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    IF @BreweryName IS NULL
        THROW 50001, 'Brewery name cannot be null.', 1;

    IF @Description IS NULL
        THROW 50002, 'Brewery description cannot be null.', 1;

    IF NOT EXISTS (SELECT 1
                   FROM dbo.BreweryPost
                   WHERE BreweryPostID = @BreweryPostID)
        THROW 50404, 'Brewery not found.', 1;

    IF @CityID IS NOT NULL AND NOT EXISTS (SELECT 1
                                            FROM dbo.City
                                            WHERE CityID = @CityID)
        THROW 50404, 'City not found.', 1;

    BEGIN TRANSACTION;

    UPDATE dbo.BreweryPost
    SET BreweryName = @BreweryName,
        Description = @Description,
        UpdatedAt   = GETDATE()
    WHERE BreweryPostID = @BreweryPostID;

    IF @CityID IS NULL
        BEGIN
            -- No location supplied: clear any existing location for this brewery.
            DELETE FROM dbo.BreweryPostLocation
            WHERE BreweryPostID = @BreweryPostID;
        END
    ELSE IF EXISTS (SELECT 1
                     FROM dbo.BreweryPostLocation
                     WHERE BreweryPostID = @BreweryPostID)
        BEGIN
            UPDATE dbo.BreweryPostLocation
            SET CityID       = @CityID,
                AddressLine1 = @AddressLine1,
                AddressLine2 = @AddressLine2,
                PostalCode   = @PostalCode,
                Coordinates  = @Coordinates
            WHERE BreweryPostID = @BreweryPostID;
        END
    ELSE
        BEGIN
            INSERT INTO dbo.BreweryPostLocation
                (BreweryPostLocationID, BreweryPostID, CityID, AddressLine1, AddressLine2, PostalCode, Coordinates)
            VALUES (ISNULL(@BreweryPostLocationID, NEWID()), @BreweryPostID, @CityID, @AddressLine1, @AddressLine2,
                    @PostalCode, @Coordinates);
        END

    COMMIT TRANSACTION;
END
