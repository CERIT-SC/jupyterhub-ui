import { ClientStorage } from "@/lib/storage";
import { AuthData, ThemeSettings } from "@/types/storage";

export const authStorage = new ClientStorage<AuthData>("auth-data");
export const themeStorage = new ClientStorage<ThemeSettings>("theme-settings");

export const defaultAuthData: AuthData = {
  token: "",
  isOldHub: true,
};

export const defaultThemeSettings: ThemeSettings = {
  themeName: "light",
  sidebarCollapsed: false,
};
