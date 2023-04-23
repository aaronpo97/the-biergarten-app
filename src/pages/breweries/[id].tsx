import getBreweryPostById from '@/services/BreweryPost/getBreweryPostById';
import BreweryPostQueryResult from '@/services/BreweryPost/types/BreweryPostQueryResult';
import { GetServerSideProps, NextPage } from 'next';
import { z } from 'zod';

interface BreweryPageProps {
  breweryPost: z.infer<typeof BreweryPostQueryResult>;
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
