import DBClient from '@/prisma/DBClient';
import { NextApiHandler } from 'next';
import { z } from 'zod';

class ServerError extends Error {
  constructor(message: string, public statusCode: number) {
    super(message);
    this.name = 'ServerError';
  }
}

export const NewBeerInfo = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(1000),
  typeId: z.string().uuid(),
  abv: z.number().min(1).max(50),
  ibu: z.number().min(2),
  breweryId: z.string().uuid(),
});

export const ResponseBody = z.object({
  message: z.string(),
  statusCode: z.number(),
  success: z.boolean(),
  payload: z.unknown(),
});

const handler: NextApiHandler<z.infer<typeof ResponseBody>> = async (req, res) => {
  try {
    const { method } = req;

    if (method !== 'POST') {
      throw new ServerError('Method not allowed', 405);
    }

    const cleanedReqBody = NewBeerInfo.safeParse(req.body);

    if (!cleanedReqBody.success) {
      throw new ServerError('Invalid request body', 400);
    }

    const { name, description, typeId, abv, ibu, breweryId } = cleanedReqBody.data;

    const user = await DBClient.instance.user.findFirstOrThrow();

    const newBeerPost = await DBClient.instance.beerPost.create({
      data: {
        name,
        description,
        abv,
        ibu,
        type: {
          connect: {
            id: typeId,
          },
        },
        postedBy: {
          connect: {
            id: user.id,
          },
        },
        brewery: {
          connect: {
            id: breweryId,
          },
        },
      },
    });

    res
      .status(200)
      .json({ message: 'Success', statusCode: 200, payload: newBeerPost, success: true });
  } catch (error) {
    if (error instanceof ServerError) {
      res.status(error.statusCode).json({
        message: error.message,
        statusCode: error.statusCode,
        payload: null,
        success: false,
      });
    } else {
      res.status(500).json({
        message: 'Internal server error',
        statusCode: 500,
        payload: null,
        success: false,
      });
    }
  }
};

export default handler;
