import { JupyterHubServerOptions } from "@/services/jupyterHub";

export interface ServerPreset {
  id: string;
  name: string;
  description: string;
  options: JupyterHubServerOptions;
}

export const serverPresets: ServerPreset[] = [
  {
    id: "minimal",
    name: "Minimal",
    description: "Basic configuration with minimal resources",
    options: {
      container_image: "cerit.io/hubs/minimalnb-cs:31-10-2024",
      cpu: "1",
      mem: "2",
      gpu: "none",
      ssh: false,
      phome: "remain",
      mountprojects: false,
      home: null,
      shmsize: "2",
    },
  },
  {
    id: "standard",
    name: "Standard",
    description: "Balanced configuration for most use cases",
    options: {
      container_image: "cerit.io/hubs/standardnb-cs:31-10-2024",
      cpu: "2",
      mem: "4",
      gpu: "none",
      ssh: true,
      phome: "remain",
      mountprojects: true,
      home: null,
      shmsize: "4",
    },
  },
  {
    id: "high-performance",
    name: "High Performance",
    description: "High-end configuration with GPU support",
    options: {
      container_image: "cerit.io/hubs/highresnb-cs:31-10-2024",
      cpu: "4",
      mem: "16",
      gpu: "1",
      ssh: true,
      phome: "remain",
      mountprojects: true,
      home: null,
      shmsize: "16",
    },
  },
];
