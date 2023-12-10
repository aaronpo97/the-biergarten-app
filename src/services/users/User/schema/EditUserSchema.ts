import { BaseCreateUserSchema } from './CreateUserValidationSchemas';

const EditUserSchema = BaseCreateUserSchema.pick({
  username: true,
  email: true,
  firstName: true,
  lastName: true,
});

export default EditUserSchema;
