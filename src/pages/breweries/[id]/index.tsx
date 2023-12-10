import getBreweryPostById from '@/services/posts/BreweryPost/getBreweryPostById';
import BreweryPostQueryResult from '@/services/posts/BreweryPost/schema/BreweryPostQueryResult';
import { GetServerSideProps, NextPage } from 'next';

import { z } from 'zod';
import Head from 'next/head';

import 'react-responsive-carousel/lib/styles/carousel.min.css'; // requires a loader
import { Carousel } from 'react-responsive-carousel';
import useMediaQuery from '@/hooks/utilities/useMediaQuery';
import { Tab } from '@headlessui/react';

import dynamic from 'next/dynamic';
import { MAPBOX_ACCESS_TOKEN } from '@/config/env';
import { CldImage } from 'next-cloudinary';

const [BreweryInfoHeader, BreweryBeersSection, BreweryCommentsSection, BreweryPostMap] = [
  dynamic(() => import('@/components/BreweryById/BreweryInfoHeader')),
  dynamic(() => import('@/components/BreweryById/BreweryBeerSection')),
  dynamic(() => import('@/components/BreweryById/BreweryCommentsSection')),
  dynamic(() => import('@/components/BreweryById/BreweryPostMap')),
];

interface BreweryPageProps {
  breweryPost: z.infer<typeof BreweryPostQueryResult>;
  mapboxToken: string;
}

const BreweryByIdPage: NextPage<BreweryPageProps> = ({ breweryPost, mapboxToken }) => {
  const [longitude, latitude] = breweryPost.location.coordinates;
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  return (
    <>
      <Head>
        <title>{breweryPost.name}</title>
        <meta name="description" content={breweryPost.description} />
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
          {breweryPost.breweryImages.length
            ? breweryPost.breweryImages.map((image, index) => (
                <div key={image.id} id={`image-${index}}`} className="w-full">
                  <CldImage
                    alt={image.alt}
                    src={image.path}
                    crop="fill"
                    height={1080}
                    width={1920}
                    className="h-96 w-full object-cover lg:h-[42rem]"
                  />
                </div>
              ))
            : Array.from({ length: 1 }).map((_, i) => (
                <div className="h-96 lg:h-[42rem]" key={i} />
              ))}
        </Carousel>
        <div className="mb-12 mt-10 flex w-full items-center justify-center">
          <div className="w-11/12 space-y-3 xl:w-9/12 2xl:w-8/12">
            <BreweryInfoHeader breweryPost={breweryPost} />
            {isDesktop ? (
              <div className="mt-4 flex flex-row space-x-3 space-y-0">
                <div className="w-[60%]">
                  <BreweryCommentsSection breweryPost={breweryPost} />
                </div>
                <div className="w-[40%] space-y-3">
                  <BreweryPostMap
                    coordinates={{ latitude, longitude }}
                    token={mapboxToken}
                  />
                  <BreweryBeersSection breweryPost={breweryPost} />
                </div>
              </div>
            ) : (
              <>
                <BreweryPostMap
                  coordinates={{ latitude, longitude }}
                  token={mapboxToken}
                />
                <Tab.Group>
                  <Tab.List className="tabs-boxed tabs items-center justify-center rounded-2xl">
                    <Tab className="tab tab-md w-1/2 uppercase ui-selected:tab-active">
                      Comments
                    </Tab>
                    <Tab className="tab tab-md w-1/2 uppercase ui-selected:tab-active">
                      Beers
                    </Tab>
                  </Tab.List>
                  <Tab.Panels className="mt-2">
                    <Tab.Panel>
                      <BreweryCommentsSection breweryPost={breweryPost} />
                    </Tab.Panel>
                    <Tab.Panel>
                      <BreweryBeersSection breweryPost={breweryPost} />
                    </Tab.Panel>
                  </Tab.Panels>
                </Tab.Group>
              </>
            )}
          </div>
        </div>
      </>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<BreweryPageProps> = async (
  context,
) => {
  const breweryPost = await getBreweryPostById(context.params!.id! as string);
  const mapboxToken = MAPBOX_ACCESS_TOKEN;

  return !breweryPost
    ? { notFound: true }
    : { props: { breweryPost: JSON.parse(JSON.stringify(breweryPost)), mapboxToken } };
};

export default BreweryByIdPage;
