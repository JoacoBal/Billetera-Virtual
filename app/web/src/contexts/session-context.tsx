import {
  createContext,
  useState,
  useContext,
  type ReactNode
} from 'react';
import { useQuery } from '@tanstack/react-query';
import { httpClient } from '@/api/httpClient';

interface AuthPayload {
  dni: string;
  name: string;
}

interface SessionContextType {
  user: AuthPayload | null;
  loading: boolean;
  error: Error | null;
  isAuthenticated: boolean;
  token: string | null;
  onSignIn: (token: string) => void;
  onSignOut: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(
    typeof window !== 'undefined' ? localStorage.getItem('jwt') : null
  );
  const [valid, setValid] = useState<boolean | undefined>(token ? true : false);

  const onSignIn = (newToken: string) => {
    localStorage.setItem('jwt', newToken);
    setToken(newToken);
  };

  const onSignOut = () => {
    localStorage.removeItem('jwt');
    setToken(null);
  };

  // Fetch user only if token exists
  const {
    data: user,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const res = await httpClient.get('/current', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setValid(undefined)
      return res.data;
    },
    enabled: !!token,
    retry: 2,
    staleTime: Infinity,
  });

  return (
    <SessionContext.Provider
      value={{
        user: user ?? null,
        loading,
        error: error as Error | null,
        isAuthenticated: valid === undefined ? !!user : valid,
        token,
        onSignIn,
        onSignOut,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};