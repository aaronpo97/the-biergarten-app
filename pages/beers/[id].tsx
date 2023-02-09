import BeerCommentForm from '@/components/BeerById/BeerCommentForm';
import BeerInfoHeader from '@/components/BeerById/BeerInfoHeader';
import BeerRecommendations from '@/components/BeerById/BeerRecommendations';
import CommentCard from '@/components/BeerById/CommentCard';
import Layout from '@/components/ui/Layout';
import UserContext from '@/contexts/userContext';
import getAllBeerComments from '@/services/BeerComment/getAllBeerComments';
import { BeerCommentQueryResultArrayT } from '@/services/BeerComment/schema/BeerCommentQueryResult';
import getBeerPostById from '@/services/BeerPost/getBeerPostById';
import getBeerRecommendations from '@/services/BeerPost/getBeerRecommendations';
import BeerPostQueryResult from '@/services/BeerPost/schema/BeerPostQueryResult';
import { BeerPost } from '@prisma/client';
import { NextPage, GetServerSideProps } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { useState, useEffect, useContext } from 'react';

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
  beerComments: BeerCommentQueryResultArrayT;
}

const BeerByIdPage: NextPage<BeerPageProps> = ({
  beerPost,
  beerRecommendations,
  beerComments,
}) => {
  const { user } = useContext(UserContext);

  const [comments, setComments] = useState(beerComments);
  useEffect(() => {
    setComments(beerComments);
  }, [beerComments]);

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
                  <div className="card-body h-full">
                    {user ? (
                      <BeerCommentForm beerPost={beerPost} setComments={setComments} />
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center">
                        <span className="text-lg font-bold">
                          Log in to leave a comment.
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="card h-[135rem] bg-base-300">
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
  const beerComments = await getAllBeerComments(
    { id: beerPost.id },
    { pageSize: 9, pageNum: 1 },
  );
  const beerRecommendations = await getBeerRecommendations({ type, brewery, id });

  const props = {
    beerPost: JSON.parse(JSON.stringify(beerPost)),
    beerRecommendations: JSON.parse(JSON.stringify(beerRecommendations)),
    beerComments: JSON.parse(JSON.stringify(beerComments)),
  };

  return { props };
};

export default BeerByIdPage;
