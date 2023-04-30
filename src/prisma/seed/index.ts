import { performance } from 'perf_hooks';
import { exit } from 'process';

import cleanDatabase from './clean/cleanDatabase';

import createNewBeerImages from './create/createNewBeerImages';
import createNewBeerPostComments from './create/createNewBeerPostComments';
import createNewBeerPostLikes from './create/createNewBeerPostLikes';
import createNewBeerPosts from './create/createNewBeerPosts';
import createNewBeerTypes from './create/createNewBeerTypes';
import createNewBreweryImages from './create/createNewBreweryImages';
import createNewBreweryPostComments from './create/createNewBreweryPostComments';
import createNewBreweryPosts from './create/createNewBreweryPosts';
import createNewUsers from './create/createNewUsers';
import createNewBreweryPostLikes from './create/createNewBreweryPostLikes';
import createNewLocations from './create/createNewLocations';
import logger from '../../config/pino/logger';

(async () => {
  try {
    const start = performance.now();

    logger.info('Clearing database.');
    await cleanDatabase();
    logger.info('Database cleared successfully, preparing to seed.');

    const users = await createNewUsers({ numberOfUsers: 10000 });
    logger.info('Users created successfully.');

    const locations = await createNewLocations({
      numberOfLocations: 1600,
      joinData: { users },
    });

    logger.info('Locations created successfully.');

    const [breweryPosts, beerTypes] = await Promise.all([
      createNewBreweryPosts({ numberOfPosts: 1500, joinData: { users, locations } }),
      createNewBeerTypes({ joinData: { users } }),
    ]);
    logger.info('Brewery posts and beer types created successfully.');

    const beerPosts = await createNewBeerPosts({
      numberOfPosts: 3000,
      joinData: { breweryPosts, beerTypes, users },
    });

    logger.info('Beer posts created successfully.');

    const [beerPostComments, breweryPostComments] = await Promise.all([
      createNewBeerPostComments({
        numberOfComments: 100000,
        joinData: { beerPosts, users },
      }),
      createNewBreweryPostComments({
        numberOfComments: 100000,
        joinData: { breweryPosts, users },
      }),
    ]);
    logger.info('Created beer post comments and brewery post comments.');

    const [beerPostLikes, breweryPostLikes] = await Promise.all([
      createNewBeerPostLikes({
        numberOfLikes: 100000,
        joinData: { beerPosts, users },
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
        numberOfImages: 20000,
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
      numberOfBeerTypes: beerTypes.length,
      numberOfBeerPostLikes: beerPostLikes.length,
      numberofBreweryPostLikes: breweryPostLikes.length,
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
