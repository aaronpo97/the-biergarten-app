import GetUserSchema from '@/services/User/schema/GetUserSchema';
import { createContext } from 'react';
import { KeyedMutator } from 'swr';
import { z } from 'zod';

const UserContext = createContext<{
  user?: z.infer<typeof GetUserSchema>;
  error?: unknown;
  isLoading: boolean;
  mutate?: KeyedMutator<z.infer<typeof GetUserSchema>>;
}>({ isLoading: true });

export default UserContext;
