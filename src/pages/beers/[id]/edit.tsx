import { NextPage } from 'next';
import Head from 'next/head';
import React from 'react';

import withPageAuthRequired from '@/util/withPageAuthRequired';
import getBeerPostById from '@/services/BeerPost/getBeerPostById';
import BeerPostQueryResult from '@/services/BeerPost/schema/BeerPostQueryResult';
import EditBeerPostForm from '@/components/EditBeerPostForm';
import FormPageLayout from '@/components/ui/forms/FormPageLayout';
import { BiBeer } from 'react-icons/bi';
import { z } from 'zod';

interface EditPageProps {
  beerPost: z.infer<typeof BeerPostQueryResult>;
}

const EditBeerPostPage: NextPage<EditPageProps> = ({ beerPost }) => {
  const pageTitle = `Edit \u201c${beerPost.name}\u201d`;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageTitle} />
      </Head>

      <FormPageLayout
        headingText={pageTitle}
        headingIcon={BiBeer}
        backLink={`/beers/${beerPost.id}`}
        backLinkText={`Back to "${beerPost.name}"`}
      >
        <EditBeerPostForm
          previousValues={{
            name: beerPost.name,
            abv: beerPost.abv,
            ibu: beerPost.ibu,
            description: beerPost.description,
            id: beerPost.id,
          }}
        />
      </FormPageLayout>
    </>
  );
};

export default EditBeerPostPage;

export const getServerSideProps = withPageAuthRequired<EditPageProps>(
  async (context, session) => {
    const beerPostId = context.params?.id as string;
    const beerPost = await getBeerPostById(beerPostId);
    const { id: userId } = session;

    if (!beerPost) {
      return { notFound: true };
    }

    const isBeerPostOwner = beerPost.postedBy.id === userId;

    return isBeerPostOwner
      ? { props: { beerPost: JSON.parse(JSON.stringify(beerPost)) } }
      : { redirect: { destination: `/beers/${beerPostId}`, permanent: false } };
  },
);
