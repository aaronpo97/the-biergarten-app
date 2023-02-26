import Head from 'next/head';
import React from 'react';

import Layout from '@/components/ui/Layout';
import { NextPage } from 'next';
import withPageAuthRequired from '@/config/auth/withPageAuthRequired';
import getBeerPostById from '@/services/BeerPost/getBeerPostById';
import { BeerPostQueryResult } from '@/services/BeerPost/schema/BeerPostQueryResult';

interface EditPageProps {
  beerPost: BeerPostQueryResult;
}

const EditPage: NextPage<EditPageProps> = ({ beerPost }) => {
  return (
    <Layout>
      <Head>
        <title>Edit {beerPost.name}</title>
        <meta name="description" content={`Edit ${beerPost.name}`} />
      </Head>
    </Layout>
  );
};

export default EditPage;

export const getServerSideProps = withPageAuthRequired<EditPageProps>(
  async (context, session) => {
    const beerPostId = context.params?.id as string;
    const beerPost = await getBeerPostById(beerPostId);
    const { id: userId } = session;

    if (!beerPost) {
      return { notFound: true };
    }

    const isBeerPostOwner = beerPost.postedBy.id === userId;

    if (!isBeerPostOwner) {
      return {
        redirect: { destination: `/beers/${beerPostId}`, permanent: false },
      };
    }

    return {
      props: {
        beerPost: JSON.parse(JSON.stringify(beerPost)),
      },
    };
  },
);
