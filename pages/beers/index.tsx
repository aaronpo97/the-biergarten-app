import { GetServerSideProps, NextPage } from 'next';
import getAllBeerPosts from '@/services/BeerPost/getAllBeerPosts';

import { useRouter } from 'next/router';
import DBClient from '@/prisma/DBClient';
import Layout from '@/components/ui/Layout';
import BeerIndexPaginationBar from '@/components/BeerIndex/BeerIndexPaginationBar';
import BeerCard from '@/components/BeerIndex/BeerCard';
import { BeerPostQueryResult } from '@/services/BeerPost/schema/BeerPostQueryResult';
import Head from 'next/head';

interface BeerPageProps {
  initialBeerPosts: BeerPostQueryResult[];
  pageCount: number;
}

const BeerPage: NextPage<BeerPageProps> = ({ initialBeerPosts, pageCount }) => {
  const router = useRouter();
  const { query } = router;

  const pageNum = parseInt(query.page_num as string, 10) || 1;
  return (
    <Layout>
      <Head>
        <title>Beer</title>
        <meta name="description" content="Beer posts" />
      </Head>
      <div className="flex items-center justify-center bg-base-100">
        <div className="my-10 flex  w-10/12 flex-col space-y-4">
          <header className="my-10">
            <div className="space-y-2">
              <h1 className="text-6xl font-bold">The Biergarten Index</h1>
              <h2 className="text-2xl font-bold">
                Page {pageNum} of {pageCount}
              </h2>
            </div>
          </header>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {initialBeerPosts.map((post) => {
              return <BeerCard post={post} key={post.id} />;
            })}
          </div>
          <div className="flex justify-center">
            <BeerIndexPaginationBar pageNum={pageNum} pageCount={pageCount} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps<BeerPageProps> = async (context) => {
  const { query } = context;
  const pageNumber = parseInt(query.page_num as string, 10) || 1;
  const pageSize = 12;
  const numberOfPosts = await DBClient.instance.beerPost.count();
  const pageCount = numberOfPosts ? Math.ceil(numberOfPosts / pageSize) : 0;
  const beerPosts = await getAllBeerPosts(pageNumber, pageSize);

  return {
    props: { initialBeerPosts: JSON.parse(JSON.stringify(beerPosts)), pageCount },
  };
};

export default BeerPage;
