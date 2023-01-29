import { GetServerSideProps, NextPage } from 'next';
import BeerPostQueryResult from '@/services/BeerPost/types/BeerPostQueryResult';
import getBeerPostById from '@/services/BeerPost/getBeerPostById';
import Layout from '@/components/ui/Layout';
import Head from 'next/head';

import Image from 'next/image';
import BeerInfoHeader from '@/components/BeerById/BeerInfoHeader';
import CommentCard from '@/components/BeerById/CommentCard';

interface BeerPageProps {
  beerPost: BeerPostQueryResult;
}

const BeerByIdPage: NextPage<BeerPageProps> = ({ beerPost }) => {
  return (
    <Layout>
      <Head>
        <title>{beerPost.name}</title>
        <meta name="description" content={beerPost.description} />
      </Head>
      <main>
        {beerPost.beerImages[0] && (
          <Image
            alt={beerPost.beerImages[0].alt}
            src={beerPost.beerImages[0].url}
            className="h-[42rem] w-full object-cover"
          />
        )}

        <div className="my-12 flex w-full items-center justify-center ">
          <div className="w-10/12 space-y-3">
            <BeerInfoHeader beerPost={beerPost} />
            <div className="mt-4 flex space-x-3">
              <div className="w-[60%] space-y-3">
                <div className="card h-[22rem] bg-base-300"></div>
                <div className="card h-[44rem] overflow-y-auto bg-base-300">
                  {beerPost.beerComments.map((comment) => (
                    <CommentCard key={comment.id} comment={comment} />
                  ))}
                </div>
              </div>
              <div className="w-[40%]">
                <div className="card h-full bg-base-300"></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps<BeerPageProps> = async (context) => {
  const beerPost = await getBeerPostById(context.params!.id! as string);
  return !beerPost
    ? { notFound: true }
    : { props: { beerPost: JSON.parse(JSON.stringify(beerPost)) } };
};

export default BeerByIdPage;
