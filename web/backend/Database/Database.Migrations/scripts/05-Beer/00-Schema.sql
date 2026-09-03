IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'Beer')
    EXEC('CREATE SCHEMA Beer');
