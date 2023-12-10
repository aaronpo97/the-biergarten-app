import GetUserSchema from '@/services/users/User/schema/GetUserSchema';

const FollowInfoSchema = GetUserSchema.pick({
  userAvatar: true,
  id: true,
  username: true,
});

export default FollowInfoSchema;
