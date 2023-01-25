import { GetServerSideProps, NextPage } from 'next';
import getAllBeerPosts from '@/services/BeerPost/getAllBeerPosts';
import BeerPostQueryResult from '@/services/BeerPost/types/BeerPostQueryResult';
import Link from 'next/link';

import { useRouter } from 'next/router';
import DBClient from '@/prisma/DBClient';
import Layout from '@/components/Layout';
import { FC } from 'react';
import Image from 'next/image';

interface BeerPageProps {
  initialBeerPosts: BeerPostQueryResult[];
  pageCount: number;
}

interface PaginationProps {
  pageNum: number;
  pageCount: number;
}

const Pagination: FC<PaginationProps> = ({ pageCount, pageNum }) => {
  const router = useRouter();

  return (
    <div className="btn-group">
      <button
        className="btn"
        disabled={pageNum <= 1}
        onClick={async () =>
          router.push({ pathname: '/beers', query: { page_num: pageNum - 1 } })
        }
      >
        «
      </button>
      <button className="btn">Page {pageNum}</button>
      <button
        className="btn"
        disabled={pageNum >= pageCount}
        onClick={async () =>
          router.push({ pathname: '/beers', query: { page_num: pageNum + 1 } })
        }
      >
        »
      </button>
    </div>
  );
};

const BeerCard: FC<{ post: BeerPostQueryResult }> = ({ post }) => {
  return (
    <div className="card bg-base-300" key={post.id}>
      <figure className="card-image h-96">
        {post.beerImages.length > 0 && (
          <Image src={post.beerImages[0].url} alt={post.name} width="1029" height="110" />
        )}
      </figure>

      <div className="card-body space-y-3">
        <div>
          <h2 className="text-3xl font-bold">
            <Link href={`/beers/${post.id}`}>{post.name}</Link>
          </h2>
          <h3 className="text-xl font-semibold">{post.brewery.name}</h3>
        </div>
        <div>
          <p>{post.description}</p>
        </div>
      </div>
    </div>
  );
};
const BeerPage: NextPage<BeerPageProps> = ({ initialBeerPosts, pageCount }) => {
  const router = useRouter();
  const { query } = router;

  const pageNum = parseInt(query.page_num as string, 10) || 1;
  return (
    <Layout>
      <div className="flex items-center justify-center bg-base-100">
        <main className="mt-10 flex w-10/12 flex-col space-y-4">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {initialBeerPosts.map((post) => {
              return <BeerCard post={post} key={post.id} />;
            })}
          </div>
          <Pagination pageNum={pageNum} pageCount={pageCount} />
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
