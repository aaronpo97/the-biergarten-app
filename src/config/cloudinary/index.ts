import { v2 as cloudinary } from 'cloudinary';

import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_KEY, CLOUDINARY_SECRET } from '../env';
import CloudinaryStorage from './CloudinaryStorage';

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_KEY,
  api_secret: CLOUDINARY_SECRET,
});

/** Cloudinary storage instance. */
const storage = new CloudinaryStorage({ cloudinary, params: { folder: 'biergarten' } });

export { cloudinary, storage };
