import logger from '../../../config/pino/logger';
import clearCloudinaryStorage from './clearCloudinaryStorage';
import clearDatabase from './clearDatabase';

(async () => {
  await clearDatabase();
  await clearCloudinaryStorage();
})()
  .then(() => {
    logger.info('Successfully cleared database and cloudinary storage.');
    process.exit(0);
  })
  .catch((err) => {
    logger.error(err);
    process.exit(1);
  });
