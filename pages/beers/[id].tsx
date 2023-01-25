import { GetServerSideProps, NextPage } from 'next';
import BeerPostQueryResult from '@/services/BeerPost/types/BeerPostQueryResult';
import getBeerPostById from '@/services/BeerPost/getBeerPostById';
import Layout from '@/components/Layout';
import Head from 'next/head';
import Link from 'next/link';
import formatDistanceStrict from 'date-fns/formatDistanceStrict';
import { useState } from 'react';

import { FaRegThumbsUp, FaThumbsUp } from 'react-icons/fa';

interface BeerPageProps {
  beerPost: BeerPostQueryResult;
}

const BeerInfoHeader: React.FC<{ beerPost: BeerPostQueryResult }> = ({ beerPost }) => {
  const createdAtDate = new Date(beerPost.createdAt);
  const timeDistance = formatDistanceStrict(createdAtDate, Date.now());

  const [isLiked, setIsLiked] = useState(false);

  return (
    <div className="card bg-base-300">
      <div className="card-body">
        <h1 className="text-4xl font-bold">{beerPost.name}</h1>
        <h2 className="text-2xl font-semibold">
          by{' '}
          <Link
            href={`/breweries/${beerPost.brewery.id}`}
            className="link-hover link text-2xl font-semibold"
          >
            {beerPost.brewery.name}
          </Link>
        </h2>

        <h3 className="italic">
          posted by{' '}
          <Link href={`/users/${beerPost.postedBy.id}`} className="link-hover link">
            {beerPost.postedBy.username}
          </Link>
          {` ${timeDistance}`} ago
        </h3>

        <p>{beerPost.description}</p>
        <div className="flex justify-between">
          <div>
            <div className="mb-1">
              <Link
                className="text-lg font-medium"
                href={`/beers/types/${beerPost.type.id}`}
              >
                {beerPost.type.name}
              </Link>
            </div>
            <div>
              <span className="mr-4 text-lg font-medium">{beerPost.abv}% ABV</span>
              <span className="text-lg font-medium">{beerPost.ibu} IBU</span>
            </div>
          </div>
          <div className="card-actions">
            <button
              type="button"
              className={`btn gap-2 rounded-2xl ${
                !isLiked ? 'btn-ghost outline' : 'btn-primary'
              }`}
              onClick={() => {
                setIsLiked(!isLiked);
              }}
            >
              {isLiked ? (
                <>
                  <FaThumbsUp className="text-2xl" />
                  <span>Liked</span>
                </>
              ) : (
                <>
                  <FaRegThumbsUp className="text-2xl" />
                  <span>Like</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CommentCard: React.FC<{ comment: BeerPostQueryResult['beerComments'][number] }> = ({
  comment,
}) => {
  return (
    <div className="card bg-base-300">
      <div className="card-body">
        <h3 className="text-2xl font-semibold">{comment.postedBy.username}</h3>
        <h4 className="italic">{`posted ${formatDistanceStrict(
          new Date(comment.createdAt),
          new Date(),
        )} ago`}</h4>
        <p>{comment.content}</p>
      </div>
    </div>
  );
};

const BeerByIdPage: NextPage<BeerPageProps> = ({ beerPost }) => {
  console.log(beerPost.beerComments);
  return (
    <Layout>
      <Head>
        <title>{beerPost.name}</title>
        <meta name="description" content={beerPost.description} />
      </Head>
      <main>
        {beerPost.beerImages[0] && (
          <img
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
                  {/* for each comment make a card */}

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
