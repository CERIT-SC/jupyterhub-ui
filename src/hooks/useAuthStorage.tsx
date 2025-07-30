import { useCallback, useEffect, useState } from "react";

import { AuthData } from "@/types/storage";
import { authStorage, defaultAuthData } from "@/services/storage";

export const useAuthStorage = () => {
  const [authData, setAuthData] = useState<AuthData>(defaultAuthData);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = authStorage.load();

    if (stored) {
      setAuthData(stored);
    }
    setIsLoaded(true);
  }, []);

  const updateAuth = useCallback((updates: Partial<AuthData>) => {
    setAuthData((prev) => {
      const newData = { ...prev, ...updates };

      authStorage.save(newData);

      return newData;
    });
  }, []);

  const clearAuth = useCallback(() => {
    authStorage.clear();
    setAuthData(defaultAuthData);
  }, []);

  return {
    authData,
    updateAuth,
    clearAuth,
    hasToken: authData.token.length > 0,
    isLoaded: isLoaded,
  };
};
