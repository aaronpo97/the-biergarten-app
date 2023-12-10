import GetUserSchema from '@/services/users/auth/schema/GetUserSchema';

const FollowInfoSchema = GetUserSchema.pick({
  userAvatar: true,
  id: true,
  username: true,
});

export default FollowInfoSchema;
