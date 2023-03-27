import { NextPage, GetServerSideProps } from 'next';
import Head from 'next/head';
import Image from 'next/image';

import BeerInfoHeader from '@/components/BeerById/BeerInfoHeader';
import BeerPostCommentsSection from '@/components/BeerById/BeerPostCommentsSection';
import BeerRecommendations from '@/components/BeerById/BeerRecommendations';
import Layout from '@/components/ui/Layout';

import getAllBeerComments from '@/services/BeerComment/getAllBeerComments';
import getBeerPostById from '@/services/BeerPost/getBeerPostById';
import getBeerRecommendations from '@/services/BeerPost/getBeerRecommendations';

import { BeerCommentQueryResultArrayT } from '@/services/BeerComment/schema/BeerCommentQueryResult';
import { BeerPostQueryResult } from '@/services/BeerPost/schema/BeerPostQueryResult';
import { BeerPost } from '@prisma/client';
import getBeerPostLikeCount from '@/services/BeerPostLike/getBeerPostLikeCount';
import getBeerCommentCount from '@/services/BeerComment/getBeerCommentCount';

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
          <div className="w-11/12 space-y-3 xl:w-9/12">
            <BeerInfoHeader beerPost={beerPost} initialLikeCount={likeCount} />
            <div className="mt-4 flex flex-col space-y-3 md:flex-row md:space-y-0 md:space-x-3">
              <BeerPostCommentsSection
                beerPost={beerPost}
                comments={beerComments}
                commentsPageCount={commentsPageCount}
              />
              <div className="md:w-[40%]">
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

  const commentCount = await getBeerCommentCount(beerPost.id);

  const commentPageCount = commentCount ? Math.ceil(commentCount / pageSize) : 0;
  const likeCount = await getBeerPostLikeCount(beerPost.id);

  const props = {
    beerPost: JSON.parse(JSON.stringify(beerPost)),
    beerRecommendations: JSON.parse(JSON.stringify(beerRecommendations)),
    beerComments: JSON.parse(JSON.stringify(beerComments)),
    commentsPageCount: JSON.parse(JSON.stringify(commentPageCount)),
    likeCount: JSON.parse(JSON.stringify(likeCount)),
  };

  return { props };
};

export default BeerByIdPage;
