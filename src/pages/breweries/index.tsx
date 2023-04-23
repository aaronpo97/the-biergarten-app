import { GetServerSideProps, NextPage } from 'next';

import Link from 'next/link';
import getAllBreweryPosts from '@/services/BreweryPost/getAllBreweryPosts';
import BreweryPostQueryResult from '@/services/BreweryPost/types/BreweryPostQueryResult';

import { FC } from 'react';
import Image from 'next/image';
import { z } from 'zod';

interface BreweryPageProps {
  breweryPosts: z.infer<typeof BreweryPostQueryResult>[];
}

const BreweryCard: FC<{ brewery: z.infer<typeof BreweryPostQueryResult> }> = ({
  brewery,
}) => {
  return (
    <div className="card" key={brewery.id}>
      <figure className="card-image h-96">
        {brewery.breweryImages.length > 0 && (
          <Image
            src={brewery.breweryImages[0].path}
            alt={brewery.name}
            width="1029"
            height="110"
          />
        )}
      </figure>
      <div className="card-body space-y-3">
        <div>
          <h2 className="text-3xl font-bold">
            <Link href={`/breweries/${brewery.id}`}>{brewery.name}</Link>
          </h2>
          <h3 className="text-xl font-semibold">{brewery.location}</h3>
        </div>
      </div>
    </div>
  );
};

const BreweryPage: NextPage<BreweryPageProps> = ({ breweryPosts }) => {
  return (
    <>
      <div className="flex items-center justify-center bg-base-100">
        <div className="my-10 flex w-10/12 flex-col space-y-4">
          <header className="my-10">
            <div className="space-y-2">
              <h1 className="text-6xl font-bold">Breweries</h1>
            </div>
          </header>
          <div className="grid gap-5 md:grid-cols-1 xl:grid-cols-2">
            {breweryPosts.map((brewery) => {
              return <BreweryCard brewery={brewery} key={brewery.id} />;
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<BreweryPageProps> = async () => {
  const breweryPosts = await getAllBreweryPosts();
  return {
    props: { breweryPosts: JSON.parse(JSON.stringify(breweryPosts)) },
  };
};

export default BreweryPage;
