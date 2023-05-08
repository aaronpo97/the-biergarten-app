import DBClient from '../../DBClient';

const cleanDatabase = async () => {
  const prisma = DBClient.instance;

  /**
   * Truncate all tables in the database.
   *
   * Declares a cursor called statements that contains all table names in the public
   * schema then loops through each table and truncates it.
   */
  await prisma.$executeRaw`
      DO $$
      DECLARE
          statements CURSOR FOR
            SELECT tablename FROM pg_tables
            WHERE schemaname = 'public'
            AND tablename != '_prisma_migrations';
      BEGIN
          FOR statement IN statements LOOP
              EXECUTE 'TRUNCATE TABLE ' || quote_ident(statement.tablename) || ' CASCADE;';
          END LOOP;
      END;
      $$ LANGUAGE plpgsql;
    `;

  await prisma.$disconnect();
};

export default cleanDatabase;
