import { NextPage, GetServerSideProps } from 'next';
import Head from 'next/head';
import Image from 'next/image';

import BeerInfoHeader from '@/components/BeerById/BeerInfoHeader';
import BeerPostCommentsSection from '@/components/BeerById/BeerPostCommentsSection';
import BeerRecommendations from '@/components/BeerById/BeerRecommendations';
import Layout from '@/components/ui/Layout';

import getBeerPostById from '@/services/BeerPost/getBeerPostById';
import getBeerRecommendations from '@/services/BeerPost/getBeerRecommendations';

import beerPostQueryResult from '@/services/BeerPost/schema/BeerPostQueryResult';
import { BeerPost } from '@prisma/client';

import { z } from 'zod';

import 'react-responsive-carousel/lib/styles/carousel.min.css'; // requires a loader
import { Carousel } from 'react-responsive-carousel';
import useMediaQuery from '@/hooks/useMediaQuery';
import { Tab } from '@headlessui/react';

interface BeerPageProps {
  beerPost: z.infer<typeof beerPostQueryResult>;
  beerRecommendations: (BeerPost & {
    brewery: { id: string; name: string };
    beerImages: { id: string; alt: string; url: string }[];
  })[];
}

const BeerByIdPage: NextPage<BeerPageProps> = ({ beerPost, beerRecommendations }) => {
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  return (
    <>
      <Head>
        <title>{beerPost.name}</title>
        <meta name="description" content={beerPost.description} />
      </Head>
      <Layout>
        <div>
          <Carousel
            className="w-full"
            useKeyboardArrows
            autoPlay
            interval={10000}
            infiniteLoop
            showThumbs={false}
          >
            {beerPost.beerImages.map((image, index) => (
              <div key={image.id} id={`image-${index}}`} className="w-full">
                <Image
                  alt={image.alt}
                  src={image.path}
                  height={1080}
                  width={1920}
                  className="h-[42rem] w-full object-cover"
                />
              </div>
            ))}
          </Carousel>

          <div className="mb-12 mt-10 flex w-full items-center justify-center ">
            <div className="w-11/12 space-y-3 xl:w-9/12">
              <BeerInfoHeader beerPost={beerPost} />

              {isDesktop ? (
                <div className="mt-4 flex flex-row space-x-3 space-y-0">
                  <div className="w-[60%]">
                    <BeerPostCommentsSection beerPost={beerPost} />
                  </div>
                  <div className="w-[40%]">
                    <BeerRecommendations beerRecommendations={beerRecommendations} />
                  </div>
                </div>
              ) : (
                <Tab.Group>
                  <Tab.List className="tabs tabs-boxed items-center justify-center rounded-2xl bg-base-300">
                    <Tab className="tab tab-lg w-1/2 uppercase ui-selected:tab-active">
                      Comments
                    </Tab>
                    <Tab className="tab tab-lg w-1/2 uppercase ui-selected:tab-active">
                      Other Beers
                    </Tab>
                  </Tab.List>
                  <Tab.Panels className="mt-2">
                    <Tab.Panel>
                      <BeerPostCommentsSection beerPost={beerPost} />
                    </Tab.Panel>
                    <Tab.Panel>
                      <BeerRecommendations beerRecommendations={beerRecommendations} />
                    </Tab.Panel>
                  </Tab.Panels>
                </Tab.Group>
              )}
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<BeerPageProps> = async (context) => {
  const beerPost = await getBeerPostById(context.params!.id! as string);

  if (!beerPost) {
    return { notFound: true };
  }

  const { type, brewery, id } = beerPost;
  const beerRecommendations = await getBeerRecommendations({ type, brewery, id });

  const props = {
    beerPost: JSON.parse(JSON.stringify(beerPost)),
    beerRecommendations: JSON.parse(JSON.stringify(beerRecommendations)),
  };

  return { props };
};

export default BeerByIdPage;
