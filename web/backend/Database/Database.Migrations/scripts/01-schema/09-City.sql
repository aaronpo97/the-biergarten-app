CREATE TABLE City
(
    CityID UNIQUEIDENTIFIER
        CONSTRAINT DF_CityID DEFAULT NEWID(),

    CityName NVARCHAR(100) NOT NULL,

    StateProvinceID UNIQUEIDENTIFIER NOT NULL,

    RowVersion ROWVERSION,

    CONSTRAINT PK_City
        PRIMARY KEY (CityID),

    CONSTRAINT FK_City_StateProvince
        FOREIGN KEY (StateProvinceID)
            REFERENCES StateProvince (StateProvinceID)
);

CREATE
NONCLUSTERED INDEX IX_City_StateProvince
    ON City(StateProvinceID);
