import { GetServerSideProps, NextPage } from 'next';
import BeerPostQueryResult from '@/services/BeerPost/types/BeerPostQueryResult';
import getBreweryPostById from '@/services/BreweryPost/getBreweryPostById';

interface BreweryPageProps {
  breweryPost: BeerPostQueryResult;
}

const BreweryByIdPage: NextPage<BreweryPageProps> = ({ breweryPost }) => {
  return (
    <>
      <h1 className="text-3xl font-bold underline">{breweryPost.name}</h1>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<BreweryPageProps> = async (
  context,
) => {
  const breweryPost = await getBreweryPostById(context.params!.id! as string);
  return !breweryPost
    ? { notFound: true }
    : { props: { breweryPost: JSON.parse(JSON.stringify(breweryPost)) } };
};

export default BreweryByIdPage;
