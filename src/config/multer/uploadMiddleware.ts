import multer from 'multer';
import { expressWrapper } from 'next-connect';
import { storage } from '../cloudinary';

const fileFilter: multer.Options['fileFilter'] = (req, file, callback) => {
  const { mimetype } = file;

  const isImage = mimetype.startsWith('image/');

  if (!isImage) {
    callback(null, false);
  }
  callback(null, true);
};

export const uploadMiddlewareMultiple = expressWrapper(
  multer({ storage, fileFilter, limits: { files: 5, fileSize: 15 * 1024 * 1024 } }).array(
    'images',
  ),
);

export const singleUploadMiddleware = expressWrapper(
  multer({
    storage,
    fileFilter,
    limits: { files: 1, fileSize: 15 * 1024 * 1024 },
  }).single('image'),
);
