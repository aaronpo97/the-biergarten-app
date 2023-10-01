import DBClient from '@/prisma/DBClient';
import { z } from 'zod';
import EditBeerPostValidationSchema from './schema/EditBeerPostValidationSchema';

const schema = EditBeerPostValidationSchema.omit({ id: true });

export default async function editBeerPostById(id: string, data: z.infer<typeof schema>) {
  const beerPost = await DBClient.instance.beerPost.update({ where: { id }, data });
  return beerPost;
}
