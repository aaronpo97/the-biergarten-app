import logger from '../../../config/pino/logger';
import cleanDatabase from './cleanDatabase';

cleanDatabase().then(() => {
  logger.info('Database cleaned');
  process.exit(0);
});
