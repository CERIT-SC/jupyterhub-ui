import { JupyterHubServerOptions } from "@/services/jupyterHub";

export const max_notebooks_per_user = 5;

/**
 * 0 - 100 percent
 */
export const notebook_usage_limits = {};

export const configuration_options = {};

export const configuration_presets = {};

// Export image configuration
export * from "./hub/imageOptions";

// Export JupyterHub options configuration
export * from "./hub/jupyterOptions";

/**
 * Default options for JupyterHub server creation
 */
export const defaultJupyterHubServerOptions: JupyterHubServerOptions = {
  container_image: "cerit.io/hubs/minimalnb-cs:31-10-2024",
  cpu: "1",
  mem: "4", // 4GB as default memory
  gpu: "none",
  ssh: false,
  phome: "remain",
  mountprojects: false,
  home: null,
  shmsize: "4", // Set shared memory size equal to memory
};
