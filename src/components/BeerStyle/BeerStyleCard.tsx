import BeerStyleQueryResult from '@/services/BeerStyles/schema/BeerStyleQueryResult';
import Link from 'next/link';
import { FC } from 'react';

import { z } from 'zod';

const BeerStyleCard: FC<{ beerStyle: z.infer<typeof BeerStyleQueryResult> }> = ({
  beerStyle,
}) => {
  return (
    <div className="card card-compact bg-base-300" key={beerStyle.id}>
      <div className="card-body justify-between">
        <div className="space-y-1">
          <Link href={`/beers/types/${beerStyle.id}`}>
            <h3 className="link-hover link overflow-hidden whitespace-normal text-2xl font-bold lg:truncate lg:text-3xl">
              {beerStyle.name}
            </h3>
            <div className="text-base-content text-sm">
              ABV Range: <span>{beerStyle.abvRange[0].toFixed(1)}%</span>
              <span> - </span>
              <span>{beerStyle.abvRange[1].toFixed(1)}%</span>
            </div>
            <div className="text-base-content text-sm">
              IBU Range: <span>{beerStyle.ibuRange[0].toFixed(1)}</span>
              <span> - </span>
              <span>{beerStyle.ibuRange[1].toFixed(1)}</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BeerStyleCard;
