import { GetServerSideProps, NextPage } from 'next';

import Link from 'next/link';
import getAllBreweryPosts from '@/services/BreweryPost/getAllBreweryPosts';
import GetAllBreweryPostsQueryResult from '@/services/BreweryPost/types/BreweryPostQueryResult';

interface BreweryPageProps {
  breweryPosts: GetAllBreweryPostsQueryResult[];
}

const BreweryPage: NextPage<BreweryPageProps> = ({ breweryPosts }) => {
  return (
    <>
      <h1 className="text-3xl font-bold underline">Brewery Posts</h1>
      {breweryPosts.map((post) => {
        return (
          <div key={post.id}>
            <h2>
              <Link href={`/breweries/${post.id}`}>{post.name}</Link>
            </h2>
          </div>
        );
      })}
    </>
  );
};

export const getServerSideProps: GetServerSideProps<BreweryPageProps> = async () => {
  const breweryPosts = await getAllBreweryPosts();
  return {
    props: { breweryPosts: JSON.parse(JSON.stringify(breweryPosts)) },
  };
};

export default BreweryPage;
