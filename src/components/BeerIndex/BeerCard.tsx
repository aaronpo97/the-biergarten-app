import Link from 'next/link';
import { FC } from 'react';
import Image from 'next/image';
import beerPostQueryResult from '@/services/BeerPost/schema/BeerPostQueryResult';
import { z } from 'zod';

const BeerCard: FC<{ post: z.infer<typeof beerPostQueryResult> }> = ({ post }) => {
  return (
    <div className="card bg-base-300" key={post.id}>
      <figure className="card-image h-96">
        {post.beerImages.length > 0 && (
          <Image
            src={post.beerImages[0].path}
            alt={post.name}
            width="1029"
            height="110"
          />
        )}
      </figure>

      <div className="card-body space-y-3">
        <div>
          <h2 className="text-3xl font-bold">
            <Link href={`/beers/${post.id}`}>{post.name}</Link>
          </h2>
          <h3 className="text-xl font-semibold">{post.brewery.name}</h3>
        </div>
      </div>
    </div>
  );
};

export default BeerCard;
