import Link from 'next/link';
import { FC, useContext } from 'react';
import Image from 'next/image';
import beerPostQueryResult from '@/services/BeerPost/schema/BeerPostQueryResult';
import { z } from 'zod';
import UserContext from '@/contexts/userContext';
import useGetLikeCount from '@/hooks/useGetLikeCount';
import BeerPostLikeButton from '../BeerById/BeerPostLikeButton';

const BeerCard: FC<{ post: z.infer<typeof beerPostQueryResult> }> = ({ post }) => {
  const { user } = useContext(UserContext);
  const { mutate, likeCount } = useGetLikeCount(post.id);

  return (
    <div className="card card-compact bg-base-300" key={post.id}>
      <figure className="h-96">
        {post.beerImages.length > 0 && (
          <Image
            src={post.beerImages[0].path}
            alt={post.name}
            width="1029"
            height="110"
          />
        )}
      </figure>

      <div className="card-body justify-between">
        <div className="space-y-1">
          <Link href={`/beers/${post.id}`}>
            <h2 className="link-hover link truncate text-2xl font-bold lg:text-3xl">
              {post.name}
            </h2>
          </Link>
          <Link href={`/breweries/${post.brewery.id}`}>
            <h3 className="text-md link-hover link truncate lg:text-xl">
              {post.brewery.name}
            </h3>
          </Link>
        </div>
        <div>
          <div>
            <p className="text-md lg:text-xl">{post.type.name}</p>
            <div className="space-x-3">
              <span className="text-sm lg:text-lg">{post.abv}% ABV</span>
              <span className="text-sm lg:text-lg">{post.ibu} IBU</span>
            </div>
          </div>
          <div className="flex justify-between">
            liked by {likeCount} users
            {user && <BeerPostLikeButton beerPostId={post.id} mutateCount={mutate} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BeerCard;
