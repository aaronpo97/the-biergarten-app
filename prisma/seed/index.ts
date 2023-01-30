import { performance } from 'perf_hooks';

import logger from '../../config/pino/logger';

import cleanDatabase from './clean/cleanDatabase';

import createNewBeerImages from './create/createNewBeerImages';
import createNewBeerPostComments from './create/createNewBeerPostComments';
import createNewBeerPosts from './create/createNewBeerPosts';
import createNewBeerTypes from './create/createNewBeerTypes';
import createNewBreweryImages from './create/createNewBreweryImages';
import createNewBreweryPostComments from './create/createNewBreweryPostComments';
import createNewBreweryPosts from './create/createNewBreweryPosts';
import createNewUsers from './create/createNewUsers';

(async () => {
  try {
    const start = performance.now();

    logger.info('Clearing database.');
    await cleanDatabase();

    logger.info('Database cleared successfully, preparing to seed.');

    const users = await createNewUsers({ numberOfUsers: 1000 });
    const [breweryPosts, beerTypes] = await Promise.all([
      createNewBreweryPosts({ numberOfPosts: 10, joinData: { users } }),
      createNewBeerTypes({ joinData: { users } }),
    ]);
    const beerPosts = await createNewBeerPosts({
      numberOfPosts: 48,
      joinData: { breweryPosts, beerTypes, users },
    });
    const [beerPostComments, breweryPostComments] = await Promise.all([
      createNewBeerPostComments({
        numberOfComments: 1000,
        joinData: { beerPosts, users },
      }),
      createNewBreweryPostComments({
        numberOfComments: 1000,
        joinData: { breweryPosts, users },
      }),
    ]);

    const [beerImages, breweryImages] = await Promise.all([
      createNewBeerImages({ numberOfImages: 1000, beerPosts }),
      createNewBreweryImages({ numberOfImages: 1000, breweryPosts }),
    ]);

    const end = performance.now();
    const timeElapsed = (end - start) / 1000;

    logger.info('Database seeded successfully.');

    logger.info({
      numberOfUsers: users.length,
      numberOfBreweryPosts: breweryPosts.length,
      numberOfBeerPosts: beerPosts.length,
      numberOfBeerTypes: beerTypes.length,
      numberOfBeerPostComments: beerPostComments.length,
      numberOfBreweryPostComments: breweryPostComments.length,
      numberOfBeerImages: beerImages.length,
      numberOfBreweryImages: breweryImages.length,
    });

    logger.info(`Database seeded in ${timeElapsed.toFixed(2)} seconds.`);

    process.exit(0);
  } catch (error) {
    logger.error('Error seeding database.');
    logger.error(error);
    process.exit(1);
  }
})();
