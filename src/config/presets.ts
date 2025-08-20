import { JupyterHubServerOptions } from "@/services/client/jupyterHub";

/**
 * Server preset configuration for simple resource selection
 */
export interface ServerPreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  options: Partial<JupyterHubServerOptions>;
  category: "minimal" | "balanced" | "performance";
}

/**
 * Pre-defined resource configurations for quick selection
 */
export const resourcePresets: ServerPreset[] = [
  {
    id: "minimal",
    name: "Minimal",
    description: "For basic data exploration and lightweight notebooks",
    icon: "cpu",
    category: "minimal",
    options: {
      cpu: "1",
      mem: "4",
      gpu: "none",
      shmsize: "4",
    },
  },
  {
    id: "standard",
    name: "Standard",
    description: "Balanced resources for most data science tasks",
    icon: "cpu",
    category: "balanced",
    options: {
      cpu: "2",
      mem: "16",
      gpu: "none",
      shmsize: "16",
    },
  },
  {
    id: "compute",
    name: "Compute Optimized",
    description: "Extra CPU power for computation-heavy tasks",
    icon: "cpu",
    category: "performance",
    options: {
      cpu: "4",
      mem: "16",
      gpu: "none",
      shmsize: "16",
    },
  },
  {
    id: "memory",
    name: "Memory Optimized",
    description: "Large memory for working with big datasets",
    icon: "cpu",
    category: "performance",
    options: {
      cpu: "2",
      mem: "32",
      gpu: "none",
      shmsize: "32",
    },
  },
  {
    id: "gpu-basic",
    name: "Basic GPU",
    description: "Entry-level GPU acceleration for ML tasks",
    icon: "cpu",
    category: "performance",
    options: {
      cpu: "2",
      mem: "16",
      gpu: "mig-1g.10gb",
      shmsize: "16",
    },
  },
  {
    id: "gpu-advanced",
    name: "Advanced GPU",
    description: "High-performance GPU for deep learning",
    icon: "cpu",
    category: "performance",
    options: {
      cpu: "4",
      mem: "32",
      gpu: "mig-2g.20gb",
      shmsize: "32",
    },
  },
];

/**
 * Quick-start presets for notebook servers
 */
export const quickstartServerPresets: ServerPreset[] = [
  {
    id: "quick-minimal",
    name: "Minimal Resources",
    description: "For basic analysis and small datasets",
    icon: "cpu",
    category: "minimal",
    options: {
      cpu: "1",
      mem: "4",
      gpu: "none",
      shmsize: "4",
    },
  },
  {
    id: "quick-balanced",
    name: "Balanced Resources",
    description: "For most data science workloads",
    icon: "cpu",
    category: "balanced",
    options: {
      cpu: "2",
      mem: "16",
      gpu: "none",
      shmsize: "16",
    },
  },
  {
    id: "quick-gpu",
    name: "GPU Compute",
    description: "For machine learning and deep learning",
    icon: "cpu",
    category: "performance",
    options: {
      cpu: "4",
      mem: "32",
      gpu: "mig-1g.10gb",
      shmsize: "32",
    },
  },
];
