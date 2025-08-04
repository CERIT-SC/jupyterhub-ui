export type SiteConfig = typeof siteConfig;

import { Home, LayoutDashboard, Server, Settings } from "lucide-react";

export const siteConfig = {
  name: "JupyterHub Client",
  description: "A modern client for JupyterHub",
  navigation: [
    {
      section: "Dashboard",
      items: [
        {
          name: "Home",
          icon: Home,
          path: "/hub/dashboard",
          disabled: false,
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
      ],
    },
    // {
    //   section: "Admin",
    //   items: [
    //     {
    //       name: "Manage",
    //       icon: Users,
    //       path: "/admin/manage",
    //     },
    //     {
    //       name: "Statistics",
    //       icon: BarChart,
    //       path: "/admin/statistics",
    //       disabled: false,
    //     },
    //   ],
    // },
    {
      section: "Settings",
      items: [
        // {
        //   name: "Profile",
        //   icon: User,
        //   path: "/profile",
        // },
        {
          name: "Preferences",
          icon: Settings,
          path: "/preferences",
        },
      ],
    },
    // {
    //   section: "Developement",
    //   items: [
    //     {
    //       name: "dev",
    //       icon: LogOut,
    //       path: "/dev",
    //     },
    //   ],
    // },
  ],
};
