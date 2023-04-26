import getBreweryPostById from '@/services/BreweryPost/getBreweryPostById';
import BreweryPostQueryResult from '@/services/BreweryPost/types/BreweryPostQueryResult';
import { GetServerSideProps, NextPage } from 'next';
import 'mapbox-gl/dist/mapbox-gl.css';
import MapGL, { Marker } from 'react-map-gl';
import { z } from 'zod';
import { FC, useContext } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import 'react-responsive-carousel/lib/styles/carousel.min.css'; // requires a loader
import { Carousel } from 'react-responsive-carousel';
import useGetBreweryPostLikeCount from '@/hooks/useGetBreweryPostLikeCount';
import useTimeDistance from '@/hooks/useTimeDistance';
import UserContext from '@/contexts/userContext';
import Link from 'next/link';
import { FaRegEdit } from 'react-icons/fa';
import format from 'date-fns/format';
import BreweryPostLikeButton from '@/components/BreweryIndex/BreweryPostLikeButton';

interface BreweryPageProps {
  breweryPost: z.infer<typeof BreweryPostQueryResult>;
}

interface BreweryInfoHeaderProps {
  breweryPost: z.infer<typeof BreweryPostQueryResult>;
}
const BreweryInfoHeader: FC<BreweryInfoHeaderProps> = ({ breweryPost }) => {
  const createdAt = new Date(breweryPost.createdAt);
  const timeDistance = useTimeDistance(createdAt);

  const { user } = useContext(UserContext);
  const idMatches = user && breweryPost.postedBy.id === user.id;
  const isPostOwner = !!(user && idMatches);

  const { likeCount, mutate } = useGetBreweryPostLikeCount(breweryPost.id);

  return (
    <article className="card flex flex-col justify-center bg-base-300">
      <div className="card-body">
        <header className="flex justify-between">
          <div className="space-y-2">
            <div>
              <h1 className="text-2xl font-bold lg:text-4xl">{breweryPost.name}</h1>
              <h2 className="text-lg font-semibold lg:text-2xl">
                Located in
                {` ${breweryPost.location.city}, ${
                  breweryPost.location.stateOrProvince || breweryPost.location.country
                }`}
              </h2>
            </div>
            <div>
              <h3 className="italic">
                {' posted by '}
                <Link
                  href={`/users/${breweryPost.postedBy.id}`}
                  className="link-hover link"
                >
                  {`${breweryPost.postedBy.username} `}
                </Link>
                {timeDistance && (
                  <span
                    className="tooltip tooltip-right"
                    data-tip={format(createdAt, 'MM/dd/yyyy')}
                  >{`${timeDistance} ago`}</span>
                )}
              </h3>
            </div>
          </div>
          {isPostOwner && (
            <div className="tooltip tooltip-left" data-tip={`Edit '${breweryPost.name}'`}>
              <Link
                href={`/breweries/${breweryPost.id}/edit`}
                className="btn-ghost btn-xs btn"
              >
                <FaRegEdit className="text-xl" />
              </Link>
            </div>
          )}
        </header>
        <div className="space-y-2">
          <p>{breweryPost.description}</p>
          <div className="flex items-end justify-between">
            <div className="space-y-1">
              <div>
                {(!!likeCount || likeCount === 0) && (
                  <span>
                    Liked by {likeCount} user{likeCount !== 1 && 's'}
                  </span>
                )}
              </div>
            </div>
            <div className="card-actions">
              {user && (
                <BreweryPostLikeButton
                  breweryPostId={breweryPost.id}
                  mutateCount={mutate}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

interface BreweryMapProps {
  latitude: number;
  longitude: number;
}
const BreweryMap: FC<BreweryMapProps> = ({ latitude, longitude }) => {
  return (
    <MapGL
      initialViewState={{
        latitude,
        longitude,
        zoom: 17,
      }}
      style={{
        width: '100%',
        height: 450,
      }}
      mapStyle="mapbox://styles/mapbox/streets-v12"
      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN as string}
      scrollZoom={true}
    >
      <Marker latitude={latitude} longitude={longitude} />
    </MapGL>
  );
};

const BreweryByIdPage: NextPage<BreweryPageProps> = ({ breweryPost }) => {
  const [longitude, latitude] = breweryPost.location.coordinates;
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
                  <Image
                    alt={image.alt}
                    src={image.path}
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

            <BreweryMap latitude={latitude} longitude={longitude} />
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
  return !breweryPost
    ? { notFound: true }
    : { props: { breweryPost: JSON.parse(JSON.stringify(breweryPost)) } };
};

export default BreweryByIdPage;
