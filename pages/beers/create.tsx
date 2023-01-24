import BeerForm from '@/components/BeerForm';
import Layout from '@/components/Layout';
import getAllBreweryPosts from '@/services/BreweryPost/getAllBreweryPosts';
import BreweryPostQueryResult from '@/services/BreweryPost/types/BreweryPostQueryResult';
import { NextPage } from 'next';

interface CreateBeerPageProps {
  breweries: BreweryPostQueryResult[];
}

const Create: NextPage<CreateBeerPageProps> = ({ breweries }) => {
  return (
    <Layout>
      <div className="align-center  flex h-full flex-col items-center justify-center">
        <div className="w-8/12">
          <BeerForm type="create" breweries={breweries} />
        </div>
      </div>
    </Layout>
  );
};

export const getServerSideProps = async () => {
  const breweryPosts = await getAllBreweryPosts();
  return {
    props: {
      breweries: breweryPosts,
    },
  };
};

export default Create;
