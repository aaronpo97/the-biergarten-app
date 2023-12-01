import Link from 'next/link';
import { FC, useContext } from 'react';

import BeerPostQueryResult from '@/services/BeerPost/schema/BeerPostQueryResult';
import { z } from 'zod';
import UserContext from '@/contexts/UserContext';
import useGetBeerPostLikeCount from '@/hooks/data-fetching/beer-likes/useBeerPostLikeCount';
import { CldImage } from 'next-cloudinary';
import BeerPostLikeButton from '../BeerById/BeerPostLikeButton';

const BeerCard: FC<{ post: z.infer<typeof BeerPostQueryResult> }> = ({ post }) => {
  const { user } = useContext(UserContext);
  const { mutate, likeCount, isLoading } = useGetBeerPostLikeCount(post.id);

  return (
    <div className="card card-compact bg-base-300" key={post.id}>
      <figure className="h-96">
        <Link href={`/beers/${post.id}`} className="h-full object-cover">
          {post.beerImages.length > 0 && (
            <CldImage
              src={post.beerImages[0].path}
              alt={post.name}
              crop="fill"
              width="3000"
              height="3000"
              className="h-full object-cover"
            />
          )}
        </Link>
      </figure>
      <div className="card-body justify-between">
        <div className="space-y-1">
          <Link href={`/beers/${post.id}`}>
            <h3 className="link-hover link overflow-hidden whitespace-normal text-2xl font-bold lg:truncate lg:text-3xl">
              {post.name}
            </h3>
          </Link>
          <Link href={`/breweries/${post.brewery.id}`}>
            <h4 className="text-md link-hover link whitespace-normal lg:truncate lg:text-xl">
              {post.brewery.name}
            </h4>
          </Link>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <Link
              className="text-md hover:underline lg:text-xl"
              href={`/beers/styles/${post.style.id}`}
            >
              {post.style.name}
            </Link>
            <div className="space-x-3">
              <span className="text-sm lg:text-lg">{post.abv.toFixed(1)}% ABV</span>
              <span className="text-sm lg:text-lg">{post.ibu.toFixed(1)} IBU</span>
            </div>
            {!isLoading && (
              <span>
                liked by {likeCount} user{likeCount === 1 ? '' : 's'}
              </span>
            )}
          </div>
          <div>
            {!!user && !isLoading && (
              <BeerPostLikeButton beerPostId={post.id} mutateCount={mutate} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BeerCard;
