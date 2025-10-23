
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
