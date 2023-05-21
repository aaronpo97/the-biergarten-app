import { z } from 'zod';

const ImageMetadataValidationSchema = z.object({
  caption: z.string().min(1, { message: 'Caption is required.' }),
  alt: z.string().min(1, { message: 'Alt text is required.' }),
});

export default ImageMetadataValidationSchema;
