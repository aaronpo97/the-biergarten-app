import SparkPost from 'sparkpost';

const { SPARKPOST_API_KEY } = process.env;

if (!SPARKPOST_API_KEY) {
  throw new Error('SPARKPOST_API_KEY is not defined');
}

const client = new SparkPost(SPARKPOST_API_KEY);

export default client;
