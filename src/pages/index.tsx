import { NextPage } from 'next';
import { CldImage } from 'next-cloudinary';
import Head from 'next/head';

const keywords = [
  'beer',
  'bier',
  'biergarten',
  'brewery',
  'brew',
  'drink',
  'alcohol',
  'brews',
  'breweries',
  'craft beer',
  'beer enthusiast',
  'beer tasting',
  'beer culture',
  'beer connoisseur',
  'beer reviews',
  'beer community',
  'beer events',
  'brewpubs',
  'beer aficionado',
  'beer types',
  'beer selection',
  'beer recommendations',
  'beer ratings',
  'beer pairing',
  'beer recipes',
];

const description = `An app for beer lovers to share their favourite brews and breweries with like-minded people online.`;

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>The Biergarten App</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords.join(', ')} />
      </Head>
      <div className="relative flex h-dvh w-full flex-col items-center justify-center bg-base-300">
        <CldImage
          src="https://res.cloudinary.com/dxie9b7na/image/upload/v1701056793/cloudinary-images/pexels-elevate-1267700_jrno3s.jpg"
          alt="Login Image"
          width={5000}
          height={5000}
          className="pointer-events-none absolute h-full w-full object-cover mix-blend-overlay"
        />
        <div className="relative flex w-9/12 flex-col space-y-3 text-base-content">
          <h1 className="text-5xl font-extrabold lg:text-8xl">The Biergarten App</h1>
          <p className="font-bold lg:text-3xl">{description}</p>
        </div>
      </div>
    </>
  );
};

export default Home;
