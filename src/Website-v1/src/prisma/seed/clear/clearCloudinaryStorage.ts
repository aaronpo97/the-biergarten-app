import { cloudinary } from '../../../config/cloudinary';

const clearCloudinaryStorage = async () => {
  await cloudinary.api.delete_resources_by_prefix('biergarten-dev/');
};

export default clearCloudinaryStorage;
