import { Brain, Code, Database } from "lucide-react";
import React from "react";

import { JupyterHubServerOptions } from "@/services/jupyterHub";

export interface ServerPreset {
  id: string;
  name: string;
  description: string;
  options: Partial<JupyterHubServerOptions>;
  icon: React.ReactNode;
  tags: string[];
}

/**
 * Predefined server presets for different JupyterHub environments
 */
export const quickstartServerPresets: ServerPreset[] = [
  {
    id: "minimal",
    name: "Minimal Notebook",
    description: "Lightweight notebook environment for basic analysis",
    icon: <Code className="h-6 w-6" />,
    options: {
      container_image: "cerit.io/hubs/minimalnb:15-07-2025-intelligence-ai",
      cpu: "1",
      mem: "4",
      shmsize: "4",
    },
    tags: ["Python 3.12", "Conda", "AI"],
  },
  {
    id: "datascience",
    name: "Data Science Notebook",
    description: "Comprehensive environment for data science workflows",
    icon: <Brain className="h-6 w-6" />,
    options: {
      container_image: "cerit.io/hubs/datasciencenb:31-10-2024-ssh",
      ssh: true,
      cpu: "2",
      mem: "16",
      shmsize: "16",
    },
    tags: ["python 3.11", "ssh", "Pandas"],
  },
  {
    id: "rstudio",
    name: "RStudio",
    description: "RStudio environment for statistical analysis",
    icon: <Database className="h-6 w-6" />,
    options: {
      container_image: "cerit.io/hubs/rstudio:4.4.1-ai",
      cpu: "2",
      mem: "16",
      shmsize: "16",
    },
    tags: ["RStudio", "R", "AI"],
  },
];
