import { API_BASE_URL } from "./index";

/**
 * Configuration for the JupyterHub API
 */

export const JUPUTERHUB_API_CONFIG = {
  baseURL: "/api/hub",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
};

export default JUPUTERHUB_API_CONFIG;
export const JUPYTERHUB_API_CONFIG = {
  baseURL: API_BASE_URL.JUPYTERHUB,
  endpoints: {},
  // API-specific settings
};

export const buildJupyterHubUrl = (endpoint: string, path?: string): string => {
  return `${JUPYTERHUB_API_CONFIG.baseURL}${endpoint}${path ? `/${path}` : ""}`;
};
