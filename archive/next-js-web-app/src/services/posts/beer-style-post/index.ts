import DBClient from '@/prisma/DBClient';
import ServerError from '@/config/util/ServerError';
import type {
  CreateBeerStyle,
  DeleteBeerStyleById,
  EditBeerStyleById,
  GetAllBeerStyles,
  GetBeerStyleById,
} from '@/services/posts/beer-style-post/types';

/**
 * The select object for retrieving beer styles.
 *
 * Satisfies the BeerStyleQueryResult zod schema.
 *
 * @remarks
 *   Prisma does not support tuples, so we have to typecast the ibuRange and abvRange fields
 *   to satisfy the zod schema.
 * @example
 *   const beerStyles = await DBClient.instance.beerStyle.findMany({
 *     select: beerStyleSelect,
 *   });
 */
const beerStyleSelect = {
  id: true,
  name: true,
  createdAt: true,
  updatedAt: true,
  abvRange: true,
  ibuRange: true,
  description: true,
  postedBy: { select: { id: true, username: true } },
  glassware: { select: { id: true, name: true } },
} as const;

/**
 * Deletes a beer style by id.
 *
 * @param args - The arguments for the service.
 * @param args.beerStyleId - The id of the beer style to delete.
 * @returns The deleted beer style.
 */
export const deleteBeerStyleService: DeleteBeerStyleById = async ({ beerStyleId }) => {
  const deleted = await DBClient.instance.beerStyle.delete({
    where: { id: beerStyleId },
    select: beerStyleSelect,
  });

  return deleted as Awaited<ReturnType<typeof deleteBeerStyleService>>;
};

/**
 * Edits a beer style by id.
 *
 * @param args - The arguments for the service.
 * @param args.beerStyleId - The id of the beer style to edit.
 * @param args.body - The data to update the beer style with.
 * @param args.body.abvRange - The abv range of the beer style.
 * @param args.body.description - The description of the beer style.
 * @param args.body.glasswareId - The id of the glassware to connect to the beer style.
 * @param args.body.ibuRange - The ibu range of the beer style.
 * @param args.body.name - The name of the beer style.
 * @returns The updated beer style.
 */
export const editBeerStyleService: EditBeerStyleById = async ({ beerStyleId, body }) => {
  const { abvRange, description, glasswareId, ibuRange, name } = body;

  const glassware = await DBClient.instance.glassware.findUnique({
    where: { id: glasswareId },
    select: { id: true },
  });

  if (!glassware) {
    throw new ServerError(
      'A glassware with that id does not exist and cannot be connected.',
      404,
    );
  }

  const updated = await DBClient.instance.beerStyle.update({
    where: { id: beerStyleId },
    data: {
      abvRange,
      description,
      ibuRange,
      name,
      glassware: { connect: { id: glasswareId } },
    },
    select: beerStyleSelect,
  });

  return updated as Awaited<ReturnType<typeof editBeerStyleService>>;
};

/**
 * Gets all beer styles with pagination.
 *
 * @param args - The arguments for the service.
 * @param args.pageNum - The page number of the results.
 * @param args.pageSize - The page size of the results.
 * @returns The beer styles and the total count of beer styles.
 */
export const getAllBeerStylesService: GetAllBeerStyles = async ({
  pageNum,
  pageSize,
}) => {
  const beerStyles = await DBClient.instance.beerStyle.findMany({
    take: pageSize,
    skip: (pageNum - 1) * pageSize,
    select: beerStyleSelect,
  });

  const beerStyleCount = await DBClient.instance.beerStyle.count();

  return {
    beerStyles: beerStyles as Awaited<
      ReturnType<typeof getAllBeerStylesService>
    >['beerStyles'],
    beerStyleCount,
  };
};

/**
 * Gets a beer style by id.
 *
 * @param args - The arguments for the service.
 * @param args.beerStyleId - The id of the beer style to get.
 * @returns The beer style.
 */
export const getBeerStyleByIdService: GetBeerStyleById = async ({ beerStyleId }) => {
  const beerStyle = await DBClient.instance.beerStyle.findUnique({
    where: { id: beerStyleId },
    select: beerStyleSelect,
  });

  return beerStyle as Awaited<ReturnType<typeof getBeerStyleByIdService>>;
};

/**
 * Creates a beer style.
 *
 * @param args - The arguments for the service.
 * @param args.body - The data to create the beer style with.
 * @param args.body.abvRange - The abv range of the beer style.
 * @param args.body.description - The description of the beer style.
 * @param args.body.glasswareId - The id of the glassware to connect to the beer style.
 * @param args.body.ibuRange - The ibu range of the beer style.
 * @param args.body.name - The name of the beer style.
 * @param args.glasswareId - The id of the glassware to connect to the beer style.
 * @param args.postedById - The id of the user who posted the beer style.
 */
export const createBeerStyleService: CreateBeerStyle = async ({
  body: { abvRange, description, ibuRange, name },
  glasswareId,
  postedById,
}) => {
  const glassware = await DBClient.instance.glassware.findUnique({
    where: { id: glasswareId },
    select: { id: true },
  });

  if (!glassware) {
    throw new ServerError(
      'A glassware with that id does not exist and cannot be connected.',
      404,
    );
  }

  const beerStyle = await DBClient.instance.beerStyle.create({
    data: {
      name,
      description,
      abvRange,
      ibuRange,
      glassware: { connect: { id: glasswareId } },
      postedBy: { connect: { id: postedById } },
    },
    select: beerStyleSelect,
  });

  return beerStyle as Awaited<ReturnType<typeof createBeerStyleService>>;
};
