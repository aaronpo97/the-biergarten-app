CREATE TABLE BreweryPostLocation
(
    BreweryPostLocationID UNIQUEIDENTIFIER
        CONSTRAINT DF_BreweryPostLocationID DEFAULT NEWID(),

    BreweryPostID UNIQUEIDENTIFIER NOT NULL,

    AddressLine1 NVARCHAR(256) NOT NULL,

    AddressLine2 NVARCHAR(256),

    PostalCode NVARCHAR(20) NOT NULL,

    CityID UNIQUEIDENTIFIER NOT NULL,

    Coordinates GEOGRAPHY NULL,

    RowVersion ROWVERSION,

    CONSTRAINT PK_BreweryPostLocation
        PRIMARY KEY (BreweryPostLocationID),

    CONSTRAINT AK_BreweryPostLocation_BreweryPostID
        UNIQUE (BreweryPostID),

    CONSTRAINT FK_BreweryPostLocation_BreweryPost
        FOREIGN KEY (BreweryPostID)
            REFERENCES BreweryPost (BreweryPostID)
            ON DELETE CASCADE,

    CONSTRAINT FK_BreweryPostLocation_City
        FOREIGN KEY (CityID)
            REFERENCES City (CityID)
);

CREATE
NONCLUSTERED INDEX IX_BreweryPostLocation_BreweryPost
    ON BreweryPostLocation(BreweryPostID);

CREATE
NONCLUSTERED INDEX IX_BreweryPostLocation_City
    ON BreweryPostLocation(CityID);

-- To assess when the time comes:

-- This would allow for efficient spatial queries to find breweries within a certain distance of a location, but it adds overhead to insert/update operations.

-- CREATE SPATIAL INDEX SIDX_BreweryPostLocation_Coordinates
--     ON BreweryPostLocation(Coordinates)
--     USING GEOGRAPHY_GRID
--     WITH (
--         GRIDS = (LEVEL_1 = MEDIUM, LEVEL_2 = MEDIUM, LEVEL_3 = MEDIUM, LEVEL_4 = MEDIUM),
--         CELLS_PER_OBJECT = 16
--     );
