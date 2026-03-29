CREATE OR ALTER PROCEDURE dbo.USP_CreateBrewery(
    @BreweryName NVARCHAR(256),
    @Description NVARCHAR(512),
    @PostedByID UNIQUEIDENTIFIER,
    @CityID UNIQUEIDENTIFIER,
    @AddressLine1 NVARCHAR(256),
    @AddressLine2 NVARCHAR(256) = NULL,
    @PostalCode NVARCHAR(20),
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
    FROM dbo.UserAccount
    WHERE UserAccountID = @PostedByID)
        THROW 50404, 'User not found.', 1;

    IF NOT EXISTS (SELECT 1
    FROM dbo.City
    WHERE CityID = @CityID)
        THROW 50404, 'City not found.', 1;

    DECLARE @NewBreweryID UNIQUEIDENTIFIER = NEWID();

    BEGIN TRANSACTION;

    INSERT INTO dbo.BreweryPost
        (BreweryPostID, BreweryName, Description, PostedByID)
    VALUES
        (@NewBreweryID, @BreweryName, @Description, @PostedByID);

    INSERT INTO dbo.BreweryPostLocation
        (BreweryPostID, CityID, AddressLine1, AddressLine2, PostalCode, Coordinates)
    VALUES
        (@NewBreweryID, @CityID, @AddressLine1, @AddressLine2, @PostalCode, @Coordinates);

    COMMIT TRANSACTION;
END
