import React, { createContext, ReactNode, useCallback, useState } from "react";
import { AxiosError } from "axios";

import { jupyterHubClient } from "@/api/jupyterhub/axios-client";
import { User } from "@/api/jupyterhub/models";

interface AuthContextType {
  user: User | null;
  isLoadingUser: boolean;
  error: Error | null;
  logout: () => void;
  loadUser: () => Promise<boolean>;
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
  const [isLoadingUser, setIsLoadingUser] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const loadUser = useCallback(async () => {
    if (!isLoadingUser) {
      setIsLoadingUser(true);
      setError(null);

      try {
        const response = await jupyterHubClient.get<User>("/user");

        setUser(response.data);

        return true;
      } catch (error: unknown) {
        console.error("Failed to load user:", error);
        if (error instanceof AxiosError) {
          setError(new Error(`${error.status}: ${error.message}`));
        } else {
          setError(error instanceof Error ? error : new Error("Unknown error"));
        }
        setUser(null);

        return false;
      } finally {
        setIsLoadingUser(false);
      }
    }

    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    window.location.href = "/api/auth/logout";
  }, []);

  const contextValue: AuthContextType = {
    user,
    isLoadingUser,
    error,
    logout,
    loadUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
