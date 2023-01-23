import { GetServerSideProps, NextPage } from 'next';
import BeerPostQueryResult from '@/services/BeerPost/types/BeerPostQueryResult';
import getBeerPostById from '@/services/BeerPost/getBeerPostById';
import Layout from '@/components/Layout';

interface BeerPageProps {
  beerPost: BeerPostQueryResult;
}

const BeerByIdPage: NextPage<BeerPageProps> = ({ beerPost }) => {
  return (
    <Layout>
      <main>
        <h1 className="text-3xl font-bold underline">{beerPost.name}</h1>
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
