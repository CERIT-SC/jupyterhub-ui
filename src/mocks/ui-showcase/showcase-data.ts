export const mockUIShowcaseData = {
  statuses: [
    { label: "Running", variant: "default" },
    { label: "Stopped", variant: "secondary" },
    { label: "Error", variant: "destructive" },
    { label: "Starting", variant: "outline" },
  ],
  cardExamples: [
    {
      title: "Performance",
      content: "System is running optimally with all services active.",
    },
    {
      title: "Storage",
      content: "85% of allocated storage space is currently in use.",
    },
    {
      title: "Network",
      content: "All network connections are stable and responsive.",
    },
    {
      title: "Security",
      content: "All security protocols are active and monitoring.",
    },
    {
      title: "Backups",
      content: "Last backup completed successfully 2 hours ago.",
    },
    {
      title: "Updates",
      content: "System is up to date. Next check scheduled for tomorrow.",
    },
  ],
  navigationItems: [
    { name: "Dashboard", href: "/", icon: "Home" },
    { name: "Notebooks", href: "/notebooks", icon: "BookOpen" },
    { name: "Servers", href: "/servers", icon: "Server" },
    { name: "Files", href: "/files", icon: "FolderOpen" },
    { name: "Settings", href: "/settings", icon: "Settings" },
  ],
};
