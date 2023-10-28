import { NextPage } from 'next';
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

const description = `The Biergarten App is an app for beer lovers to share their favourite brews and breweries with like-minded people online.`;

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>The Biergarten App</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords.join(', ')} />
      </Head>

      <div className="flex h-full w-full items-center justify-center bg-primary">
        <div className="w-9/12 text-center lg:w-8/12">
          <h1 className="text-3xl font-bold md:text-4xl lg:text-5xl xl:text-8xl">
            The Biergarten App
          </h1>
          <p className="mt-4 text-lg lg:text-2xl">{description}</p>
        </div>
      </div>
    </>
  );
};

export default Home;
