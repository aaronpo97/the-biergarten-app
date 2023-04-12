import { UserExtendedNextApiRequest } from '@/config/auth/types';
import ServerError from '@/config/util/ServerError';
import getBeerPostById from '@/services/BeerPost/getBeerPostById';
import { NextApiResponse } from 'next';
import { NextHandler } from 'next-connect';

interface CheckIfBeerPostOwnerRequest extends UserExtendedNextApiRequest {
  query: { id: string };
}

const checkIfBeerPostOwner = async <RequestType extends CheckIfBeerPostOwnerRequest>(
  req: RequestType,
  res: NextApiResponse,
  next: NextHandler,
) => {
  const { id } = req.query;
  const user = req.user!;
  const beerPost = await getBeerPostById(id);

  if (!beerPost) {
    throw new ServerError('Beer post not found', 404);
  }

  if (beerPost.postedBy.id !== user.id) {
    throw new ServerError('You are not authorized to edit this beer post', 403);
  }

  return next();
};

export default checkIfBeerPostOwner;
