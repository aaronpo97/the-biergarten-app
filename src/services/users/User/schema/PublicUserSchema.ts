import GetUserSchema from '@/services/users/User/schema/GetUserSchema';

const PublicUserSchema = GetUserSchema.pick({
  id: true,
  name: true,
  createdAt: true,
  username: true,
  role: true,
});

export default PublicUserSchema;
