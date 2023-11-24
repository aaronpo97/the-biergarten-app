import logger from '../../../config/pino/logger';
import clearDatabase from './clearDatabase';

clearDatabase().then(() => {
  logger.info('Database cleared');
  process.exit(0);
});
