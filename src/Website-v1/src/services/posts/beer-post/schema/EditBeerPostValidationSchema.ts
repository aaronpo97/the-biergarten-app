import { z } from 'zod';
import CreateBeerPostValidationSchema from './CreateBeerPostValidationSchema';

const EditBeerPostValidationSchema = CreateBeerPostValidationSchema.omit({
  breweryId: true,
  styleId: true,
}).extend({ id: z.string().cuid() });

export default EditBeerPostValidationSchema;
