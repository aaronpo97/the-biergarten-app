import SparkPost from 'sparkpost';
import { SPARKPOST_API_KEY } from '../env';

const client = new SparkPost(SPARKPOST_API_KEY);

export default client;
