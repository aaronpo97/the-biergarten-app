import CreateBeerPostForm from '@/components/CreateBeerPostForm';
import FormPageLayout from '@/components/ui/forms/FormPageLayout';

import withPageAuthRequired from '@/getServerSideProps/withPageAuthRequired';
import DBClient from '@/prisma/DBClient';
import getAllBreweryPosts from '@/services/BreweryPost/getAllBreweryPosts';
import BreweryPostQueryResult from '@/services/BreweryPost/types/BreweryPostQueryResult';
import { BeerType } from '@prisma/client';
import { NextPage } from 'next';
import { BiBeer } from 'react-icons/bi';
import { z } from 'zod';

interface CreateBeerPageProps {
  breweries: z.infer<typeof BreweryPostQueryResult>[];
  types: BeerType[];
}

const Create: NextPage<CreateBeerPageProps> = ({ breweries, types }) => {
  return (
    <FormPageLayout
      headingText="Create a new beer"
      headingIcon={BiBeer}
      backLink="/beers"
      backLinkText="Back to beers"
    >
      <CreateBeerPostForm breweries={breweries} types={types} />
    </FormPageLayout>
  );
};

export const getServerSideProps = withPageAuthRequired<CreateBeerPageProps>(async () => {
  const breweryPosts = await getAllBreweryPosts();
  const beerTypes = await DBClient.instance.beerType.findMany();

  return {
    props: {
      breweries: JSON.parse(JSON.stringify(breweryPosts)),
      types: JSON.parse(JSON.stringify(beerTypes)),
    },
  };
});

export default Create;
