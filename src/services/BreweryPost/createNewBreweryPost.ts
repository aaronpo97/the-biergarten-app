import DBClient from '@/prisma/DBClient';
import { z } from 'zod';
import CreateBreweryPostSchema from './types/CreateBreweryPostSchema';
import BreweryPostQueryResult from './types/BreweryPostQueryResult';

const CreateNewBreweryPostWithUserAndLocationSchema = CreateBreweryPostSchema.omit({
  address: true,
  city: true,
  country: true,
  stateOrProvince: true,
}).extend({
  userId: z.string().cuid(),
  locationId: z.string().cuid(),
});

const createNewBreweryPost = async ({
  dateEstablished,
  description,
  locationId,
  name,
  userId,
}: z.infer<typeof CreateNewBreweryPostWithUserAndLocationSchema>) => {
  const breweryPost: z.infer<typeof BreweryPostQueryResult> =
    await DBClient.instance.breweryPost.create({
      data: {
        name,
        description,
        dateEstablished,
        location: { connect: { id: locationId } },
        postedBy: { connect: { id: userId } },
      },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        dateEstablished: true,
        postedBy: { select: { id: true, username: true } },
        breweryImages: { select: { path: true, caption: true, id: true, alt: true } },
        location: {
          select: {
            city: true,
            address: true,
            coordinates: true,
            country: true,
            stateOrProvince: true,
          },
        },
      },
    });

  return breweryPost;
};

export default createNewBreweryPost;
