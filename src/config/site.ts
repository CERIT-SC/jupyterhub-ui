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
          name: "Tokens",
          icon: Server,
          path: "/hub/tokens",
        },
        {
          name: "Presets",
          icon: Server,
          path: "/hub/presets",
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
        {
          name: "About",
          icon: Server,
          path: "/hub/about",
        }
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
