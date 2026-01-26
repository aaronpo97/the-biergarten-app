import FormPageLayout from '@/components/ui/forms/FormPageLayout';
import withPageAuthRequired from '@/util/withPageAuthRequired';
import { NextPage } from 'next';
import Head from 'next/head';

import { FaBeer } from 'react-icons/fa';
import CreateBreweryPostForm from '@/components/BreweryPost/CreateBreweryPostForm';
import { MAPBOX_ACCESS_TOKEN } from '@/config/env';

interface CreateBreweryPageProps {
  mapboxAccessToken: string;
}

const CreateBreweryPage: NextPage<CreateBreweryPageProps> = ({ mapboxAccessToken }) => {
  return (
    <>
      <Head>
        <title>Create Brewery</title>
      </Head>
      <div className="flex w-full flex-col items-center justify-center">
        <div className="w-full">
          <FormPageLayout
            backLink="/breweries"
            backLinkText="Back to Breweries"
            headingText="Create Brewery"
            headingIcon={FaBeer}
          >
            <CreateBreweryPostForm mapboxAccessToken={mapboxAccessToken} />
          </FormPageLayout>
        </div>
      </div>
    </>
  );
};

export default CreateBreweryPage;

export const getServerSideProps = withPageAuthRequired<CreateBreweryPageProps>(
  async () => ({ props: { mapboxAccessToken: MAPBOX_ACCESS_TOKEN } }),
);
