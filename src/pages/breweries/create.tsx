import FormPageLayout from '@/components/ui/forms/FormPageLayout';
import withPageAuthRequired from '@/util/withPageAuthRequired';
import { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';

import { FaBeer } from 'react-icons/fa';
import CreateBreweryPostForm from '@/components/CreateBreweryPostForm';

const CreateBreweryPage: NextPage = () => {
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
            <CreateBreweryPostForm />
          </FormPageLayout>
        </div>
      </div>
    </>
  );
};

export default CreateBreweryPage;

export const getServerSideProps: GetServerSideProps = withPageAuthRequired();
