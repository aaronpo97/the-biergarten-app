import { NextPage, GetServerSideProps } from 'next';
import Head from 'next/head';
import getBeerPostById from '@/services/BeerPost/getBeerPostById';

import BeerPostQueryResult from '@/services/BeerPost/schema/BeerPostQueryResult';

import { z } from 'zod';

import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { Carousel } from 'react-responsive-carousel';
import useMediaQuery from '@/hooks/utilities/useMediaQuery';
import { Tab } from '@headlessui/react';
import dynamic from 'next/dynamic';
import { CldImage } from 'next-cloudinary';

const [BeerInfoHeader, BeerPostCommentsSection, BeerRecommendations] = [
  dynamic(() => import('@/components/BeerById/BeerInfoHeader')),
  dynamic(() => import('@/components/BeerById/BeerPostCommentsSection')),
  dynamic(() => import('@/components/BeerById/BeerRecommendations')),
];

interface BeerPageProps {
  beerPost: z.infer<typeof BeerPostQueryResult>;
}

const BeerByIdPage: NextPage<BeerPageProps> = ({ beerPost }) => {
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  return (
    <>
      <Head>
        <title>{beerPost.name}</title>
        <meta name="description" content={beerPost.description} />
      </Head>
      <>
        <Carousel
          className="w-full"
          useKeyboardArrows
          autoPlay
          interval={10000}
          infiniteLoop
          showThumbs={false}
        >
          {beerPost.beerImages.length
            ? beerPost.beerImages.map((image, index) => (
                <div key={image.id} id={`image-${index}}`} className="w-full">
                  <CldImage
                    alt={image.alt}
                    src={image.path}
                    height={1080}
                    crop="fill"
                    width={1920}
                    className="h-96 w-full object-cover lg:h-[42rem]"
                  />
                </div>
              ))
            : Array.from({ length: 1 }).map((_, i) => (
                <div className="h-96 lg:h-[42rem]" key={i} />
              ))}
        </Carousel>

        <main className="mb-12 mt-10 flex w-full items-center justify-center">
          <div className="w-11/12 space-y-3 xl:w-9/12 2xl:w-8/12">
            <BeerInfoHeader beerPost={beerPost} />

            {isDesktop ? (
              <div className="mt-4 flex flex-row space-x-3 space-y-0">
                <div className="w-[60%]">
                  <BeerPostCommentsSection beerPost={beerPost} />
                </div>
                <div className="w-[40%]">
                  <BeerRecommendations beerPost={beerPost} />
                </div>
              </div>
            ) : (
              <Tab.Group>
                <Tab.List className="tabs-boxed tabs items-center justify-center rounded-2xl">
                  <Tab className="tab tab-md w-1/2 uppercase ui-selected:tab-active">
                    Comments
                  </Tab>
                  <Tab className="tab tab-md w-1/2 uppercase ui-selected:tab-active">
                    Other Beers
                  </Tab>
                </Tab.List>
                <Tab.Panels className="mt-2">
                  <Tab.Panel>
                    <BeerPostCommentsSection beerPost={beerPost} />
                  </Tab.Panel>
                  <Tab.Panel>
                    <BeerRecommendations beerPost={beerPost} />
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

export const getServerSideProps: GetServerSideProps<BeerPageProps> = async (context) => {
  const beerPost = await getBeerPostById(context.params!.id! as string);

  if (!beerPost) {
    return { notFound: true };
  }

  const props = {
    beerPost: JSON.parse(JSON.stringify(beerPost)),
  };

  return { props };
};

export default BeerByIdPage;
