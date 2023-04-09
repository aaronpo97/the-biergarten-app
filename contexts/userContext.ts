import useUser from '@/hooks/useUser';
import GetUserSchema from '@/services/User/schema/GetUserSchema';
import { createContext } from 'react';
import { z } from 'zod';

const UserContext = createContext<{
  user?: z.infer<typeof GetUserSchema>;
  error?: unknown;
  isLoading: boolean;
  mutate?: ReturnType<typeof useUser>['mutate'];
}>({ isLoading: true });

export default UserContext;
