import CreateBeerPostForm from '@/components/CreateBeerPostForm';
import FormPageLayout from '@/components/ui/forms/FormPageLayout';

import withPageAuthRequired from '@/util/withPageAuthRequired';
import DBClient from '@/prisma/DBClient';
import BreweryPostQueryResult from '@/services/BreweryPost/types/BreweryPostQueryResult';
import { BeerType } from '@prisma/client';
import { NextPage } from 'next';
import { BiBeer } from 'react-icons/bi';
import { z } from 'zod';
import getBreweryPostById from '@/services/BreweryPost/getBreweryPostById';

interface CreateBeerPageProps {
  brewery: z.infer<typeof BreweryPostQueryResult>;
  types: BeerType[];
}

const CreateBeerPost: NextPage<CreateBeerPageProps> = ({ brewery, types }) => {
  return (
    <FormPageLayout
      headingText="Create a new beer"
      headingIcon={BiBeer}
      backLink="/beers"
      backLinkText="Back to beers"
    >
      <CreateBeerPostForm brewery={brewery} types={types} />
    </FormPageLayout>
  );
};

export const getServerSideProps = withPageAuthRequired<CreateBeerPageProps>(
  async (context) => {
    const id = context.params?.id as string;

    const breweryPost = await getBreweryPostById(id);

    const beerTypes = await DBClient.instance.beerType.findMany();

    return {
      props: {
        brewery: JSON.parse(JSON.stringify(breweryPost)),
        types: JSON.parse(JSON.stringify(beerTypes)),
      },
    };
  },
);

export default CreateBeerPost;
