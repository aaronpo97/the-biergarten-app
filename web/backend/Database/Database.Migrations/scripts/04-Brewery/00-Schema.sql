IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'Brewery')
    EXEC('CREATE SCHEMA Brewery');
