import { GetServerSideProps, NextPage } from 'next';
import getAllBeerPosts from '@/services/BeerPost/getAllBeerPosts';

import { useRouter } from 'next/router';
import DBClient from '@/prisma/DBClient';
import Layout from '@/components/ui/Layout';
import Pagination from '@/components/BeerIndex/Pagination';
import BeerCard from '@/components/BeerIndex/BeerCard';
import BeerPostQueryResult from '@/services/BeerPost/schema/BeerPostQueryResult';

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
      <div className="flex items-center justify-center bg-base-100">
        <main className="my-10 flex w-10/12 flex-col space-y-4">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {initialBeerPosts.map((post) => {
              return <BeerCard post={post} key={post.id} />;
            })}
          </div>
          <div className="flex justify-center">
            <Pagination pageNum={pageNum} pageCount={pageCount} />
          </div>
        </main>
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
