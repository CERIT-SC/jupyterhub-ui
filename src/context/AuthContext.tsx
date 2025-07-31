import React, {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";
import { AxiosError } from "axios";
import { redirect, useRouter } from "next/navigation";

import { jupyterHubClient } from "@/api/jupyterhub/axios-client";
import { User } from "@/api/jupyterhub/models";
import { useAuthStorage } from "@/hooks/useAuthStorage";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  logout: () => void;
  login: (token: string, useOldHub: boolean) => void;
}

// Create the auth context with a default undefined value
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const router = useRouter();

  const {
    isLoaded: tokenIsLoaded,
    hasToken,
    updateAuth,
    clearAuth,
  } = useAuthStorage();

  const checkToken = useCallback(async () => {
    setIsLoadingUser(true);
    setError(null);

    if (!tokenIsLoaded) {
      setUser(null);

      return;
    }

    if (!hasToken) {
      setError(null);
      setUser(null);
      setIsLoadingUser(false);

      return;
    }

    try {
      const user = await jupyterHubClient.get<User>("/user");

      setUser(user.data);
      setIsLoadingUser(false);
    } catch (error: unknown) {
      console.error(error);
      if (error instanceof AxiosError) {
        setError(new Error(error.status?.toString() + error.message));
      } else {
        setError(
          error instanceof Error
            ? error
            : new Error("An unknown error occurred"),
        );
      }
      setUser(null);
      setIsLoadingUser(false);
    }
  }, [tokenIsLoaded]);

  useEffect(() => {
    checkToken();
  }, [checkToken]);

  // Log out function
  const logout = useCallback(() => {
    setIsLoadingUser(true);
    setUser(null);
    clearAuth();
    redirect("/api/auth/logout");
  }, []);

  const login = useCallback(
    (token: string, useOldHub: boolean) => {
      updateAuth({ token: token, isOldHub: useOldHub });
      checkToken();
      if (error || user === null) {
        return;
      }
      router.push("/hub");
    },
    [checkToken],
  );

  const contextValue: AuthContextType = {
    user,
    isLoading: isLoadingUser,
    error,
    logout,
    login,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
