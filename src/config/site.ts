import {
  House,
  LayoutDashboard,
  Server,
  Settings,
  LucideIcon,
} from "lucide-react";

export type SiteConfig = {
  name: string;
  description: string;
  navigation: {
    section: string;
    development?: boolean;
    items: {
      name: string;
      icon: LucideIcon;
      path: string;
      disabled?: boolean;
      development?: boolean;
      external?: boolean;
    }[];
  }[];
};

export const siteConfig: SiteConfig = {
  name: "JupyterHub Client",
  description: "A modern client for JupyterHub",
  navigation: [
    {
      section: "Dashboard",
      items: [
        {
          name: "Home",
          icon: House,
          path: "/hub/dashboard",
        },
        {
          name: "Notebooks",
          icon: LayoutDashboard,
          path: "/hub/notebooks",
        },
        {
          name: "Create Notebook",
          icon: LayoutDashboard,
          path: "/hub/spawn/options?container_image=cerit.io%2Fhubs%2Fdatasciencenb%3A31-10-2024-ssh&ssh=true&cpu=2&mem=16&shmsize=16",
        },
        {
          name: "Preparing Notebook",
          icon: LayoutDashboard,
          path: "/hub/spawn/progress/ds",
        },
        {
          name: "Tokens",
          icon: Server,
          path: "/hub/tokens",
        },
      ],
    },
    {
      section: "Settings",
      items: [
        {
          name: "Preferences",
          icon: Settings,
          path: "/preferences",
          disabled: true,
        },
      ],
    },
    {
      section: "Development",
      development: true,
      items: [
        {
          name: "api tester",
          icon: Settings,
          path: "/dev/api",
          development: true,
        },
        {
          name: "ui showcase",
          icon: Settings,
          path: "/dev/ui",
          development: true,
        },
      ],
    },
  ],
};
