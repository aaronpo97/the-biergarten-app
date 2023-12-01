import BeerStyleQueryResult from '@/services/BeerStyles/schema/BeerStyleQueryResult';
import Link from 'next/link';
import { FC } from 'react';

import { z } from 'zod';

const BeerStyleCard: FC<{ beerStyle: z.infer<typeof BeerStyleQueryResult> }> = ({
  beerStyle,
}) => {
  return (
    <div className="card card-compact bg-base-300">
      <div className="card-body justify-between">
        <div className="space-y-1">
          <Link href={`/beers/styles/${beerStyle.id}`}>
            <h3 className="link-hover link overflow-hidden whitespace-normal text-2xl font-bold lg:truncate lg:text-3xl">
              {beerStyle.name}
            </h3>
          </Link>
          <div className="w-25 flex flex-row space-x-3">
            <div className="text-sm font-bold">
              ABV Range:{' '}
              <span>
                {beerStyle.abvRange[0].toFixed(1)}% - {beerStyle.abvRange[0].toFixed(1)}%
              </span>
            </div>
            <div className="text-sm font-bold">
              IBU Range:{' '}
              <span>
                {beerStyle.ibuRange[0].toFixed(1)} - {beerStyle.ibuRange[1].toFixed(1)}
              </span>
            </div>
          </div>

          <div className="h-20">
            <p className="line-clamp-3 overflow-ellipsis">{beerStyle.description}</p>
          </div>

          <div className="font-semibold">
            Recommended Glassware:{' '}
            <span className="text-sm font-bold italic">{beerStyle.glassware.name}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BeerStyleCard;
