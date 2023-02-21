import BeerCommentForm from '@/components/BeerById/BeerCommentForm';
import BeerInfoHeader from '@/components/BeerById/BeerInfoHeader';
import BeerRecommendations from '@/components/BeerById/BeerRecommendations';
import CommentCard from '@/components/BeerById/CommentCard';
import Layout from '@/components/ui/Layout';
import UserContext from '@/contexts/userContext';
import DBClient from '@/prisma/DBClient';
import getAllBeerComments from '@/services/BeerComment/getAllBeerComments';
import { BeerCommentQueryResultArrayT } from '@/services/BeerComment/schema/BeerCommentQueryResult';
import getBeerPostById from '@/services/BeerPost/getBeerPostById';
import getBeerRecommendations from '@/services/BeerPost/getBeerRecommendations';
import { BeerPostQueryResult } from '@/services/BeerPost/schema/BeerPostQueryResult';
import { BeerPost } from '@prisma/client';
import { NextPage, GetServerSideProps } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect, useContext } from 'react';

interface BeerPageProps {
  beerPost: BeerPostQueryResult;
  beerRecommendations: (BeerPost & {
    brewery: { id: string; name: string };
    beerImages: { id: string; alt: string; url: string }[];
  })[];
  beerComments: BeerCommentQueryResultArrayT;
  commentsPageCount: number;
  likeCount: number;
}

const BeerByIdPage: NextPage<BeerPageProps> = ({
  beerPost,
  beerRecommendations,
  beerComments,
  commentsPageCount,
  likeCount,
}) => {
  const { user } = useContext(UserContext);
  const [comments, setComments] = useState(beerComments);

  const router = useRouter();

  const commentsPageNum = router.query.comments_page
    ? parseInt(router.query.comments_page as string, 10)
    : 1;

  useEffect(() => {
    setComments(beerComments);
  }, [beerComments]);

  return (
    <Layout>
      <Head>
        <title>{beerPost.name}</title>
        <meta name="description" content={beerPost.description} />
      </Head>
      <div>
        {beerPost.beerImages[0] && (
          <Image
            alt={beerPost.beerImages[0].alt}
            src={beerPost.beerImages[0].path}
            height={1080}
            width={1920}
            className="h-[42rem] w-full object-cover"
          />
        )}

        <div className="my-12 flex w-full items-center justify-center ">
          <div className="w-11/12 space-y-3 lg:w-9/12">
            <BeerInfoHeader beerPost={beerPost} initialLikeCount={likeCount} />
            <div className="mt-4 flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
              <div className="w-full space-y-3 sm:w-[60%]">
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
                <div className="card bg-base-300 pb-6">
                  {comments.map((comment) => (
                    <CommentCard key={comment.id} comment={comment} />
                  ))}

                  <div className="flex items-center justify-center">
                    <div className="btn-group grid w-6/12 grid-cols-2">
                      <Link
                        className={`btn-outline btn ${
                          commentsPageNum === 1
                            ? 'btn-disabled pointer-events-none'
                            : 'pointer-events-auto'
                        }`}
                        href={{
                          pathname: `/beers/${beerPost.id}`,
                          query: { comments_page: commentsPageNum - 1 },
                        }}
                        scroll={false}
                      >
                        Next Comments
                      </Link>
                      <Link
                        className={`btn btn-outline ${
                          commentsPageNum === commentsPageCount
                            ? 'btn-disabled pointer-events-none'
                            : 'pointer-events-auto'
                        }`}
                        href={{
                          pathname: `/beers/${beerPost.id}`,
                          query: { comments_page: commentsPageNum + 1 },
                        }}
                        scroll={false}
                      >
                        Previous Comments
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              <div className="sm:w-[40%]">
                <BeerRecommendations beerRecommendations={beerRecommendations} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps<BeerPageProps> = async (context) => {
  const beerPost = await getBeerPostById(context.params!.id! as string);

  const beerCommentPageNum = parseInt(context.query.comments_page as string, 10) || 1;

  if (!beerPost) {
    return { notFound: true };
  }

  const { type, brewery, id } = beerPost;
  const beerRecommendations = await getBeerRecommendations({ type, brewery, id });

  const pageSize = 5;
  const beerComments = await getAllBeerComments(
    { id: beerPost.id },
    { pageSize, pageNum: beerCommentPageNum },
  );
  const numberOfPosts = await DBClient.instance.beerComment.count({
    where: { beerPostId: beerPost.id },
  });
  const pageCount = numberOfPosts ? Math.ceil(numberOfPosts / pageSize) : 0;
  const likeCount = await DBClient.instance.beerPostLike.count({
    where: { beerPostId: beerPost.id },
  });

  const props = {
    beerPost: JSON.parse(JSON.stringify(beerPost)),
    beerRecommendations: JSON.parse(JSON.stringify(beerRecommendations)),
    beerComments: JSON.parse(JSON.stringify(beerComments)),
    commentsPageCount: JSON.parse(JSON.stringify(pageCount)),
    likeCount: JSON.parse(JSON.stringify(likeCount)),
  };

  return { props };
};

export default BeerByIdPage;
