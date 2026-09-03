IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'Auth')
    EXEC('CREATE SCHEMA Auth');
