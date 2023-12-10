import { NextPage, GetServerSideProps } from 'next';
import Head from 'next/head';

import { z } from 'zod';

import useMediaQuery from '@/hooks/utilities/useMediaQuery';
import { Tab } from '@headlessui/react';
import getBeerStyleById from '@/services/posts/BeerStyles/getBeerStyleById';
import BeerStyleHeader from '@/components/BeerStyleById/BeerStyleHeader';
import BeerStyleQueryResult from '@/services/posts/BeerStyles/schema/BeerStyleQueryResult';
import BeerStyleCommentSection from '@/components/BeerStyleById/BeerStyleCommentSection';
import BeerStyleBeerSection from '@/components/BeerStyleById/BeerStyleBeerSection';

interface BeerStylePageProps {
  beerStyle: z.infer<typeof BeerStyleQueryResult>;
}

const BeerStyleByIdPage: NextPage<BeerStylePageProps> = ({ beerStyle }) => {
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  return (
    <>
      <Head>
        <title>{beerStyle.name}</title>
        <meta name="description" content={beerStyle.description} />
      </Head>
      <>
        <main className="mb-12 mt-10 flex w-full items-center justify-center">
          <div className="w-11/12 space-y-3 xl:w-9/12 2xl:w-8/12">
            <BeerStyleHeader beerStyle={beerStyle} />

            {isDesktop ? (
              <div className="mt-4 flex flex-row space-x-3 space-y-0">
                <div className="w-[60%]">
                  <BeerStyleCommentSection beerStyle={beerStyle} />
                </div>
                <div className="w-[40%]">
                  <BeerStyleBeerSection beerStyle={beerStyle} />
                </div>
              </div>
            ) : (
              <Tab.Group>
                <Tab.List className="tabs-boxed tabs items-center justify-center rounded-2xl">
                  <Tab className="tab tab-md w-1/2 uppercase ui-selected:tab-active">
                    Comments
                  </Tab>
                  <Tab className="tab tab-md w-1/2 uppercase ui-selected:tab-active">
                    Beers in this Style
                  </Tab>
                </Tab.List>
                <Tab.Panels className="mt-2">
                  <Tab.Panel>
                    <BeerStyleCommentSection beerStyle={beerStyle} />
                  </Tab.Panel>
                  <Tab.Panel>
                    <BeerStyleBeerSection beerStyle={beerStyle} />
                  </Tab.Panel>
                </Tab.Panels>
              </Tab.Group>
            )}
          </div>
        </main>
      </>
    </>
  );
};

export default BeerStyleByIdPage;

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const id = params!.id as string;
  const beerStyle = await getBeerStyleById(id);
  if (!beerStyle) {
    return { notFound: true };
  }

  return { props: { beerStyle: JSON.parse(JSON.stringify(beerStyle)) } };
};
