import { GetServerSideProps, NextPage } from 'next';
import BeerPostQueryResult from '@/services/BeerPost/types/BeerPostQueryResult';
import getBeerPostById from '@/services/BeerPost/getBeerPostById';
import Layout from '@/components/ui/Layout';
import Head from 'next/head';

import Image from 'next/image';
import BeerInfoHeader from '@/components/BeerById/BeerInfoHeader';
import CommentCard from '@/components/BeerById/CommentCard';
import { useState } from 'react';

import { BeerPost } from '@prisma/client';
import BeerCommentQueryResult from '@/services/BeerPost/types/BeerCommentQueryResult';
import BeerCommentForm from '../../components/BeerById/BeerCommentForm';
import BeerRecommendations from '../../components/BeerById/BeerRecommendations';
import getBeerRecommendations from '../../services/BeerPost/getBeerRecommendations';
import getAllBeerComments from '../../services/BeerPost/getAllBeerComments';

interface BeerPageProps {
  beerPost: BeerPostQueryResult;
  beerRecommendations: (BeerPost & {
    brewery: {
      id: string;
      name: string;
    };
    beerImages: {
      id: string;
      alt: string;
      url: string;
    }[];
  })[];
  beerComments: BeerCommentQueryResult[];
}

const BeerByIdPage: NextPage<BeerPageProps> = ({
  beerPost,
  beerRecommendations,
  beerComments,
}) => {
  const [comments, setComments] = useState(beerComments);
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
            height={1080}
            width={1920}
            className="h-[42rem] w-full object-cover"
          />
        )}

        <div className="my-12 flex w-full items-center justify-center ">
          <div className="w-10/12 space-y-3">
            <BeerInfoHeader beerPost={beerPost} />
            <div className="mt-4 flex space-x-3">
              <div className="w-[60%] space-y-3">
                <div className="card h-96 bg-base-300">
                  <div className="card-body">
                    <BeerCommentForm beerPost={beerPost} setComments={setComments} />
                  </div>
                </div>
                <div className="card bg-base-300">
                  {comments.map((comment) => (
                    <CommentCard key={comment.id} comment={comment} />
                  ))}
                </div>
              </div>
              <div className="w-[40%]">
                <BeerRecommendations beerRecommendations={beerRecommendations} />
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

  if (!beerPost) {
    return { notFound: true };
  }

  const { type, brewery, id } = beerPost;
  const beerComments = await getAllBeerComments({ id }, { pageSize: 3, pageNum: 1 });
  const beerRecommendations = await getBeerRecommendations({ type, brewery });

  const props = {
    beerPost: JSON.parse(JSON.stringify(beerPost)),
    beerRecommendations: JSON.parse(JSON.stringify(beerRecommendations)),
    beerComments: JSON.parse(JSON.stringify(beerComments)),
  };

  return { props };
};

export default BeerByIdPage;
