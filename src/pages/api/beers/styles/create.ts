import { UserExtendedNextApiRequest } from '@/config/auth/types';
import getCurrentUser from '@/config/nextConnect/middleware/getCurrentUser';
import validateRequest from '@/config/nextConnect/middleware/validateRequest';
import ServerError from '@/config/util/ServerError';
import DBClient from '@/prisma/DBClient';

import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { z } from 'zod';

const BeerStyleValidationSchema = z.object({
  id: z.string().cuid(),
  name: z.string(),
  postedBy: z.object({
    id: z.string().cuid(),
    username: z.string(),
  }),
  glassware: z.object({
    id: z.string().cuid(),
    name: z.string(),
    description: z.string(),
  }),
  description: z.string(),
  createdAt: z.date(),
  updatedAt: z.date().nullable(),
});

const CreateBeerStyleValidationSchema = BeerStyleValidationSchema.omit({
  id: true,
  postedBy: true,
  createdAt: true,
  updatedAt: true,
  glassware: true,
}).extend({
  glasswareId: z.string().cuid(),
});

interface CreateBeerStyleRequest extends UserExtendedNextApiRequest {
  body: z.infer<typeof CreateBeerStyleValidationSchema>;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface GetBeerStyleRequest extends NextApiRequest {
  query: {
    id: string;
  };
}

const createBeerStyle = async (
  req: CreateBeerStyleRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  const user = req.user!;
  const { name, description, glasswareId } = req.body;

  const glassware = await DBClient.instance.glassware.findUnique({
    where: { id: glasswareId },
  });

  if (!glassware) {
    throw new ServerError('Glassware not found', 404);
  }

  const newBeerStyle = await DBClient.instance.beerStyle.create({
    data: {
      description,
      name,
      postedBy: { connect: { id: user.id } },
      glassware: { connect: { id: glassware.id } },
    },
    select: {
      id: true,
      name: true,
      postedBy: { select: { id: true, username: true } },
      createdAt: true,
      updatedAt: true,
    },
  });

  res.status(200).json({
    message: 'Beer posts retrieved successfully',
    statusCode: 200,
    payload: newBeerStyle,
    success: true,
  });
};

const router = createRouter<
  CreateBeerStyleRequest,
  NextApiResponse<z.infer<typeof APIResponseValidationSchema>>
>();

router.get(
  validateRequest({ bodySchema: CreateBeerStyleValidationSchema }),
  getCurrentUser,
  createBeerStyle,
);

const handler = router.handler();

export default handler;
