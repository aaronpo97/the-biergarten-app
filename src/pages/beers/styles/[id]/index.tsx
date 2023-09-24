import getBeerStyleById from '@/services/BeerStyles/getBeerStyleById';
import BeerStyleQueryResult from '@/services/BeerStyles/schema/BeerStyleQueryResult';
import { GetServerSideProps, NextPage } from 'next';
import { z } from 'zod';

interface BeerStylePageProps {
  beerStyle: z.infer<typeof BeerStyleQueryResult>;
}

const BeerStylePage: NextPage<BeerStylePageProps> = ({ beerStyle }) => {
  return (
    <div>
      <h1>{beerStyle.name}</h1>
      <p>{beerStyle.description}</p>
    </div>
  );
};

export default BeerStylePage;

export const getServerSideProps: GetServerSideProps<BeerStylePageProps> = async (
  context,
) => {
  const beerStyle = await getBeerStyleById(context.params!.id! as string);

  if (!beerStyle) {
    return {
      notFound: true,
    };
  }

  return { props: { beerStyle: JSON.parse(JSON.stringify(beerStyle)) } };
};
