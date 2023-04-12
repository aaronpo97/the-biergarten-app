/* eslint-disable @typescript-eslint/naming-convention */
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_KEY, CLOUDINARY_SECRET } from '../env';

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_KEY,
  api_secret: CLOUDINARY_SECRET,
});

// @ts-expect-error
const storage = new CloudinaryStorage({ cloudinary, params: { folder: 'BeerApp' } });

/** Configuration object for Cloudinary image upload. */
const cloudinaryConfig = { cloudinary, storage };

export default cloudinaryConfig;
