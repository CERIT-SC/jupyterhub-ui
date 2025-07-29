export interface AuthData {
  token: string;
  isOldHub: boolean;
  lastUsed?: Date;
}

export interface ThemeSettings {
  themeName: string;
  sidebarCollapsed: boolean;
}
