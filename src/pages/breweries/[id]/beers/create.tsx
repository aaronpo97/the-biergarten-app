import CreateBeerPostForm from '@/components/CreateBeerPostForm';
import FormPageLayout from '@/components/ui/forms/FormPageLayout';

import withPageAuthRequired from '@/util/withPageAuthRequired';
import DBClient from '@/prisma/DBClient';
import BreweryPostQueryResult from '@/services/posts/brewery-post/schema/BreweryPostQueryResult';
import { BeerStyle } from '@prisma/client';
import { NextPage } from 'next';
import { BiBeer } from 'react-icons/bi';
import { z } from 'zod';
import { getBreweryPostByIdService } from '@/services/posts/brewery-post';

interface CreateBeerPageProps {
  brewery: z.infer<typeof BreweryPostQueryResult>;
  styles: BeerStyle[];
}

const CreateBeerPost: NextPage<CreateBeerPageProps> = ({ brewery, styles }) => {
  return (
    <FormPageLayout
      headingText="Create a new beer"
      headingIcon={BiBeer}
      backLink="/beers"
      backLinkText="Back to beers"
    >
      <CreateBeerPostForm brewery={brewery} styles={styles} />
    </FormPageLayout>
  );
};

export const getServerSideProps = withPageAuthRequired<CreateBeerPageProps>(
  async (context) => {
    const id = context.params?.id as string;

    const breweryPost = await getBreweryPostByIdService({ breweryPostId: id });
    const beerStyles = await DBClient.instance.beerStyle.findMany();

    return {
      props: {
        brewery: JSON.parse(JSON.stringify(breweryPost)),
        styles: JSON.parse(JSON.stringify(beerStyles)),
      },
    };
  },
);

export default CreateBeerPost;
