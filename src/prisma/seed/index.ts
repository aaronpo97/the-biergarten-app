import { performance } from 'perf_hooks';
import { exit } from 'process';

import cleanDatabase from './clean/cleanDatabase';

import createNewBeerImages from './create/createNewBeerImages';
import createNewBeerPostComments from './create/createNewBeerPostComments';
import createNewBeerPostLikes from './create/createNewBeerPostLikes';
import createNewBeerPosts from './create/createNewBeerPosts';
import createNewBeerStyles from './create/createNewBeerStyles';
import createNewBreweryImages from './create/createNewBreweryImages';
import createNewBreweryPostComments from './create/createNewBreweryPostComments';
import createNewBreweryPosts from './create/createNewBreweryPosts';
import createNewUsers from './create/createNewUsers';
import createNewBreweryPostLikes from './create/createNewBreweryPostLikes';
import createNewLocations from './create/createNewLocations';
import logger from '../../config/pino/logger';
import createAdminUser from './create/createAdminUser';
import createNewBeerStyleComments from './create/createNewBeerStyleComments';
import createNewBeerStyleLikes from './create/createNewBeerStyleLikes';

(async () => {
  try {
    const start = performance.now();

    logger.info('Clearing database.');
    await cleanDatabase();
    logger.info('Database cleared successfully, preparing to seed.');

    await createAdminUser();
    logger.info('Admin user created successfully.');

    const users = await createNewUsers({ numberOfUsers: 10000 });
    logger.info('Users created successfully.');

    const locations = await createNewLocations({
      numberOfLocations: 500,
      joinData: { users },
    });

    logger.info('Locations created successfully.');

    const [breweryPosts, beerStyles] = await Promise.all([
      createNewBreweryPosts({ numberOfPosts: 450, joinData: { users, locations } }),
      createNewBeerStyles({ joinData: { users } }),
    ]);
    logger.info('Brewery posts and beer types created successfully.');

    const beerPosts = await createNewBeerPosts({
      numberOfPosts: 3000,
      joinData: { breweryPosts, beerStyles, users },
    });

    logger.info('Beer posts created successfully.');

    const [beerPostComments, beerStyleComments, breweryPostComments] = await Promise.all([
      createNewBeerPostComments({
        numberOfComments: 100000,
        joinData: { beerPosts, users },
      }),
      createNewBeerStyleComments({
        numberOfComments: 5000,
        joinData: { beerStyles, users },
      }),
      createNewBreweryPostComments({
        numberOfComments: 50000,
        joinData: { breweryPosts, users },
      }),
    ]);
    logger.info('Created beer post comments and brewery post comments.');

    const [beerPostLikes, beerStyleLikes, breweryPostLikes] = await Promise.all([
      createNewBeerPostLikes({
        numberOfLikes: 500000,
        joinData: { beerPosts, users },
      }),
      createNewBeerStyleLikes({
        numberOfLikes: 50000,
        joinData: { beerStyles, users },
      }),
      createNewBreweryPostLikes({
        numberOfLikes: 100000,
        joinData: { breweryPosts, users },
      }),
    ]);
    logger.info('Created beer post likes, and brewery post likes.');

    const [beerImages, breweryImages] = await Promise.all([
      createNewBeerImages({
        numberOfImages: 20000,
        joinData: { beerPosts, users },
      }),
      createNewBreweryImages({
        numberOfImages: 5000,
        joinData: { breweryPosts, users },
      }),
    ]);
    logger.info('Created beer images and brewery images.');

    const end = performance.now();
    const timeElapsed = (end - start) / 1000;

    logger.info('Database seeded successfully.');
    logger.info({
      numberOfUsers: users.length,
      numberOfBreweryPosts: breweryPosts.length,
      numberOfBeerPosts: beerPosts.length,
      numberOfBeerStyles: beerStyles.length,
      numberOfBeerStyleLikes: beerStyleLikes.length,
      numberOfBeerStyleComments: beerStyleComments.length,
      numberOfBeerPostLikes: beerPostLikes.length,
      numberOfBreweryPostLikes: breweryPostLikes.length,
      numberOfBeerPostComments: beerPostComments.length,
      numberOfBreweryPostComments: breweryPostComments.length,
      numberOfBeerImages: beerImages.length,
      numberOfBreweryImages: breweryImages.length,
    });
    logger.info(`Database seeded in ${timeElapsed.toFixed(2)} seconds.`);

    exit(0);
  } catch (error) {
    logger.error('Error seeding database.');
    logger.error(error);
    exit(1);
  }
})();
