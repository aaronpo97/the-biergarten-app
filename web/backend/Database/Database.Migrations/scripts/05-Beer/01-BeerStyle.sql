CREATE TABLE Beer.BeerStyle
(
    BeerStyleID UNIQUEIDENTIFIER
        CONSTRAINT DF_BeerStyleID DEFAULT NEWID(),

    StyleName NVARCHAR(100) NOT NULL,

    Description NVARCHAR(MAX),

    RowVersion ROWVERSION,

    CONSTRAINT PK_BeerStyle
        PRIMARY KEY (BeerStyleID),

    CONSTRAINT AK_BeerStyle_StyleName
        UNIQUE (StyleName)
);
