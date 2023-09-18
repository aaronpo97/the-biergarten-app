import { UserExtendedNextApiRequest } from '@/config/auth/types';
import getCurrentUser from '@/config/nextConnect/middleware/getCurrentUser';
import validateRequest from '@/config/nextConnect/middleware/validateRequest';
import DBClient from '@/prisma/DBClient';

import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { z } from 'zod';

const BeerTypeValidationSchema = z.object({
  id: z.string().cuid(),
  name: z.string(),
  postedBy: z.object({
    id: z.string().cuid(),
    username: z.string(),
  }),
  createdAt: z.date(),
  updatedAt: z.date().nullable(),
});

const CreateBeerTypeValidationSchema = BeerTypeValidationSchema.omit({
  id: true,
  postedBy: true,
  createdAt: true,
  updatedAt: true,
});

interface CreateBeerTypeRequest extends UserExtendedNextApiRequest {
  body: z.infer<typeof CreateBeerTypeValidationSchema>;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface GetBeerTypeRequest extends NextApiRequest {
  query: {
    id: string;
  };
}

const createBeerType = async (
  req: CreateBeerTypeRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  const user = req.user!;
  const { name } = req.body;

  const newBeerType = await DBClient.instance.beerType.create({
    data: {
      name,
      postedBy: { connect: { id: user.id } },
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
    payload: newBeerType,
    success: true,
  });
};

const router = createRouter<
  CreateBeerTypeRequest,
  NextApiResponse<z.infer<typeof APIResponseValidationSchema>>
>();

router.get(
  validateRequest({ bodySchema: CreateBeerTypeValidationSchema }),
  getCurrentUser,
  createBeerType,
);

const handler = router.handler();

export default handler;
