import BeerForm from '@/components/BeerForm';
import Layout from '@/components/Layout';
import DBClient from '@/prisma/DBClient';
import getAllBreweryPosts from '@/services/BreweryPost/getAllBreweryPosts';
import BreweryPostQueryResult from '@/services/BreweryPost/types/BreweryPostQueryResult';
import { BeerType } from '@prisma/client';
import { NextPage } from 'next';

import { BiBeer } from 'react-icons/bi';

interface CreateBeerPageProps {
  breweries: BreweryPostQueryResult[];
  types: BeerType[];
}

const Create: NextPage<CreateBeerPageProps> = ({ breweries, types }) => {
  return (
    <Layout>
      <div className="align-center my-12 flex h-full flex-col items-center justify-center">
        <div className="w-8/12">
          <div className="flex flex-col items-center space-y-1">
            <BiBeer className="text-5xl" />
            <h1 className="text-3xl font-bold">Create a New Beer</h1>
          </div>

          <BeerForm type="create" breweries={breweries} types={types} />
        </div>
      </div>
    </Layout>
  );
};

export const getServerSideProps = async () => {
  const breweryPosts = await getAllBreweryPosts();

  const beerTypes = await DBClient.instance.beerType.findMany();
  return {
    props: {
      breweries: JSON.parse(JSON.stringify(breweryPosts)),
      types: JSON.parse(JSON.stringify(beerTypes)),
    },
  };
};

export default Create;
