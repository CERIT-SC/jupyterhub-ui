import { useCallback, useState } from "react";

import { defaultThemeSettings, themeStorage } from "@/services/storage";
import { ThemeSettings } from "@/types/storage";

export const useThemeStorage = () => {
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(() => {
    return themeStorage.load() || defaultThemeSettings;
  });

  const updateTheme = useCallback((updates: Partial<ThemeSettings>) => {
    setThemeSettings((prev) => {
      const newSettings = { ...prev, ...updates };

      themeStorage.save(newSettings);

      return newSettings;
    });
  }, []);

  const resetTheme = useCallback(() => {
    themeStorage.clear();
    setThemeSettings(defaultThemeSettings);
  }, []);

  return {
    themeSettings,
    updateTheme,
    resetTheme,
  };
};
