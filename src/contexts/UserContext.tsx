import useUser from '@/hooks/auth/useUser';
import GetUserSchema from '@/services/users/auth/schema/GetUserSchema';
import { ReactNode, createContext } from 'react';
import { z } from 'zod';

const UserContext = createContext<{
  user?: z.infer<typeof GetUserSchema>;
  error?: unknown;
  isLoading: boolean;
  mutate?: ReturnType<typeof useUser>['mutate'];
}>({ isLoading: true });

export default UserContext;

type AuthProviderComponent = (props: { children: ReactNode }) => JSX.Element;

export const AuthProvider: AuthProviderComponent = ({ children }) => {
  const { error, isLoading, mutate, user } = useUser();
  return (
    <UserContext.Provider value={{ isLoading, error, mutate, user }}>
      {children}
    </UserContext.Provider>
  );
};
