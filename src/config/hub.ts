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

export const minimalJupyterHubServerOptions: JupyterHubServerOptions = {
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
/**
 * Default options for JupyterHub server creation
 */
export const defaultJupyterHubServerOptions: Partial<JupyterHubServerOptions> =
  {
    gpu: "none",
    ssh: false,
    phome: "remain",
    mountprojects: false,
    home: null,
  };

export type HubConfig = {
  max_notebooks_per_user: number;
  simpleOptions: {
    image: {
      id: string;
      name: string;
      description: string;
      icon: string;
      tags: string[];
      options: Partial<JupyterHubServerOptions>;
    }[];
    resource: {};
  };
};

export const hubConfig: HubConfig = {
  max_notebooks_per_user: 5,
  simpleOptions: {
    image: [
      {
        id: "simple",
        name: "Minimal Notebook",
        description: "Lightweight notebook environment with AI support",
        icon: "code",
        tags: ["Python 3.12", "Conda", "AI"],
        options: {
          container_image: "cerit.io/hubs/minimalnb:15-07-2025-intelligence-ai",
        },
      },
      {
        id: "datascience",
        name: "Data Science Notebook",
        description: "Comprehensive environment for data science workflows",
        icon: "code",
        tags: ["python 3.11", "ssh", "Pandas"],
        options: {
          container_image: "cerit.io/hubs/datasciencenb:31-10-2024-ssh",
          ssh: true,
        },
      },
      {
        id: "r",
        name: "R Studio",
        description: "R environment with statistical computing capabilities",
        icon: "bar-chart",
        tags: ["R 4.4.1", "RStudio", "AI"],
        options: {
          container_image: "cerit.io/hubs/rstudio:4.4.1-ai",
        },
      },
      {
        id: "tf",
        name: "TensorFlow",
        description: "Machine learning environment with GPU support",
        icon: "cpu",
        tags: ["TensorFlow 2.17.0", "GPU", "TensorBoard"],
        options: {
          container_image: "cerit.io/hubs/tensorflowgpu:2.17.0",
        },
      },
      {
        id: "matlab",
        name: "MATLAB",
        description: "Technical computing environment",
        icon: "calculator",
        tags: ["MATLAB R2024a"],
        options: {
          container_image: "cerit.io/hubs/matlab:r2024a",
        },
      },
      {
        id: "various",
        name: "Google Colab",
        description: "Colab-compatible environment",
        icon: "cloud",
        tags: ["Python", "Colab"],
        options: {
          container_image: "cerit.io/hubs/colab:2025-01-07",
        },
      },
      {
        id: "folding",
        name: "Protein Folding",
        description: "Specialized environment for protein structure prediction",
        icon: "dna",
        tags: ["ColabFold 1.5.5", "CUDA"],
        options: {
          container_image: "cerit.io/hubs/colabfold:1.5.5-cu12",
        },
      },
    ],
    resource: [{}],
  },
};
