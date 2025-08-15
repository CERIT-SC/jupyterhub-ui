import { ClientStorage } from "@/lib/storage";
import { ThemeSettings } from "@/types/storage";

export const themeStorage = new ClientStorage<ThemeSettings>("theme-settings");

export const defaultThemeSettings: ThemeSettings = {
  themeName: "light",
  sidebarCollapsed: false,
};
