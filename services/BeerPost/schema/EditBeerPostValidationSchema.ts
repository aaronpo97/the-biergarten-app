import { z } from 'zod';
import CreateBeerPostValidationSchema from './CreateBeerPostValidationSchema';

const EditBeerPostValidationSchema = CreateBeerPostValidationSchema.omit({
  breweryId: true,
  typeId: true,
}).extend({ id: z.string().uuid() });

export default EditBeerPostValidationSchema;
