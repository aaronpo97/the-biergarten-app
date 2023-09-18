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
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BeerStyleCard;
