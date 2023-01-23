import logger from '../../config/pino/logger';

import cleanDatabase from './clean/cleanDatabase';
import createNewBeerPostComments from './create/createNewBeerPostComments';
import createNewBeerPosts from './create/createNewBeerPosts';
import createNewBeerTypes from './create/createNewBeerTypes';
import createNewBreweryPostComments from './create/createNewBreweryPostComments';
import createNewBreweryPosts from './create/createNewBreweryPosts';
import createNewUsers from './create/createNewUsers';

(async () => {
  try {
    logger.info('Cleaning database...');
    await cleanDatabase();
    logger.info('Database cleaned successfully, preparing to seed');

    const users = await createNewUsers({ numberOfUsers: 10 });
    logger.info(`Created ${users.length} users`);

    const breweryPosts = await createNewBreweryPosts({
      numberOfPosts: 100,
      joinData: { users },
    });
    logger.info(`Created ${breweryPosts.length} brewery posts`);

    const beerTypes = await createNewBeerTypes({ joinData: { users } });
    logger.info(`Created ${beerTypes.length} beer types`);

    const beerPosts = await createNewBeerPosts({
      numberOfPosts: 100,
      joinData: { breweryPosts, beerTypes, users },
    });
    logger.info(`Created ${beerPosts.length} beer posts`);

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
    logger.info(`Created ${beerPostComments.length} beer post comments`);
    logger.info(`Created ${breweryPostComments.length} brewery post comments`);

    logger.info('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Error seeding database');
    logger.error(error);
    process.exit(1);
  }
})();
