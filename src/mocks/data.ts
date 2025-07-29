import { NotebookData } from "@/components/notebook/notebooks-grid";

export type ServerStatus =
  | "running"
  | "stopped"
  | "starting"
  | "stopping"
  | "pending"
  | "failed";
export type ServerType =
  | "jupyter"
  | "jupyterlab"
  | "rstudio"
  | "vscode"
  | "terminal";

/**
 * Mock data for notebooks
 */
export const EXAMPLE_NOTEBOOKS: NotebookData[] = [
  {
    id: "1",
    name: "Data Analysis",
    lastActive: "2 hours ago",
    status: "running",
    cpuUsage: 45,
    memoryUsage: 32,
  },
  {
    id: "2",
    name: "Machine Learning Model",
    lastActive: "1 day ago",
    status: "stopped",
    cpuUsage: 0,
    memoryUsage: 0,
  },
  {
    id: "3",
    name: "Visualization Project",
    lastActive: "3 days ago",
    status: "stopped",
    cpuUsage: 0,
    memoryUsage: 0,
  },
  {
    id: "4",
    name: "NLP Experiment",
    lastActive: "Just now",
    status: "running",
    cpuUsage: 78,
    memoryUsage: 85,
  },
  {
    id: "5",
    name: "Time Series Analysis",
    lastActive: "5 hours ago",
    status: "starting",
    cpuUsage: 12,
    memoryUsage: 24,
  },
  {
    id: "6",
    name: "Critical Resource Test",
    lastActive: "1 minute ago",
    status: "running",
    cpuUsage: 95,
    memoryUsage: 92,
  },
];

/**
 * Server data structure
 */
export interface ServerData {
  id: string;
  name: string;
  type: ServerType;
  status: ServerStatus;
  startedAt: string;
  url: string;
  cpuLimit: number;
  memoryLimit: number;
  cpuUsage: number;
  memoryUsage: number;
  owner: string;
  image: string;
}

/**
 * Mock data for servers
 */
export const MOCK_SERVERS: ServerData[] = [
  {
    id: "srv-001",
    name: "Python Data Science",
    type: "jupyterlab",
    status: "running",
    startedAt: "2023-06-15T08:30:00Z",
    url: "https://jupyter.example.org/user/johndoe/lab",
    cpuLimit: 4,
    memoryLimit: 8192,
    cpuUsage: 35,
    memoryUsage: 42,
    owner: "johndoe",
    image: "jupyter/datascience-notebook:latest",
  },
  {
    id: "srv-002",
    name: "R Statistical Computing",
    type: "rstudio",
    status: "running",
    startedAt: "2023-06-14T14:22:00Z",
    url: "https://jupyter.example.org/user/janedoe/rstudio",
    cpuLimit: 2,
    memoryLimit: 4096,
    cpuUsage: 65,
    memoryUsage: 58,
    owner: "janedoe",
    image: "rocker/rstudio:latest",
  },
  {
    id: "srv-003",
    name: "VS Code Server",
    type: "vscode",
    status: "stopped",
    startedAt: "2023-06-10T09:15:00Z",
    url: "https://jupyter.example.org/user/bobsmith/vscode",
    cpuLimit: 2,
    memoryLimit: 4096,
    cpuUsage: 0,
    memoryUsage: 0,
    owner: "bobsmith",
    image: "codercom/code-server:latest",
  },
  {
    id: "srv-004",
    name: "Terminal Session",
    type: "terminal",
    status: "running",
    startedAt: "2023-06-15T11:05:00Z",
    url: "https://jupyter.example.org/user/alicejones/terminal",
    cpuLimit: 1,
    memoryLimit: 2048,
    cpuUsage: 15,
    memoryUsage: 30,
    owner: "alicejones",
    image: "jupyter/base-notebook:latest",
  },
  {
    id: "srv-005",
    name: "Deep Learning Environment",
    type: "jupyterlab",
    status: "starting",
    startedAt: "2023-06-15T15:45:00Z",
    url: "https://jupyter.example.org/user/sarahlee/lab",
    cpuLimit: 8,
    memoryLimit: 32768,
    cpuUsage: 5,
    memoryUsage: 10,
    owner: "sarahlee",
    image: "tensorflow/tensorflow:latest-gpu-jupyter",
  },
];

/**
 * User data structure
 */
export interface UserData {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: "user" | "admin" | "service";
  status: "active" | "inactive" | "suspended";
  lastLogin: string;
  serverCount: number;
  resourceUsage: {
    cpu: number;
    memory: number;
    storage: number;
  };
}

/**
 * Mock data for users
 */
export const MOCK_USERS: UserData[] = [
  {
    id: "usr-001",
    username: "johndoe",
    fullName: "John Doe",
    email: "john.doe@example.com",
    role: "admin",
    status: "active",
    lastLogin: "2023-06-15T14:30:00Z",
    serverCount: 2,
    resourceUsage: {
      cpu: 5.5,
      memory: 8192,
      storage: 15360,
    },
  },
  {
    id: "usr-002",
    username: "janedoe",
    fullName: "Jane Doe",
    email: "jane.doe@example.com",
    role: "user",
    status: "active",
    lastLogin: "2023-06-15T12:15:00Z",
    serverCount: 1,
    resourceUsage: {
      cpu: 2.0,
      memory: 4096,
      storage: 8192,
    },
  },
  {
    id: "usr-003",
    username: "bobsmith",
    fullName: "Bob Smith",
    email: "bob.smith@example.com",
    role: "user",
    status: "inactive",
    lastLogin: "2023-06-10T09:45:00Z",
    serverCount: 0,
    resourceUsage: {
      cpu: 0,
      memory: 0,
      storage: 5120,
    },
  },
  {
    id: "usr-004",
    username: "alicejones",
    fullName: "Alice Jones",
    email: "alice.jones@example.com",
    role: "user",
    status: "active",
    lastLogin: "2023-06-15T11:20:00Z",
    serverCount: 1,
    resourceUsage: {
      cpu: 1.0,
      memory: 2048,
      storage: 4096,
    },
  },
  {
    id: "usr-005",
    username: "sarahlee",
    fullName: "Sarah Lee",
    email: "sarah.lee@example.com",
    role: "user",
    status: "active",
    lastLogin: "2023-06-15T15:50:00Z",
    serverCount: 1,
    resourceUsage: {
      cpu: 8.0,
      memory: 16384,
      storage: 32768,
    },
  },
  {
    id: "usr-006",
    username: "mikebrown",
    fullName: "Mike Brown",
    email: "mike.brown@example.com",
    role: "service",
    status: "active",
    lastLogin: "2023-06-15T10:05:00Z",
    serverCount: 0,
    resourceUsage: {
      cpu: 0.5,
      memory: 1024,
      storage: 2048,
    },
  },
];

/**
 * Usage statistics structure
 */
export interface UsageStatistics {
  totalUsers: number;
  activeUsers: number;
  totalServers: number;
  activeServers: number;
  resourceUtilization: {
    cpu: {
      allocated: number;
      used: number;
      limit: number;
    };
    memory: {
      allocated: number;
      used: number;
      limit: number;
    };
    storage: {
      allocated: number;
      used: number;
      limit: number;
    };
  };
  serversByType: {
    type: string;
    count: number;
  }[];
  usageHistory: {
    date: string;
    activeUsers: number;
    activeServers: number;
    cpuUsage: number;
    memoryUsage: number;
  }[];
}

/**
 * Mock usage statistics
 */
export const MOCK_STATISTICS: UsageStatistics = {
  totalUsers: 25,
  activeUsers: 18,
  totalServers: 30,
  activeServers: 22,
  resourceUtilization: {
    cpu: {
      allocated: 64,
      used: 35,
      limit: 100,
    },
    memory: {
      allocated: 131072, // 128 GB
      used: 87040, // 85 GB
      limit: 262144, // 256 GB
    },
    storage: {
      allocated: 1048576, // 1 TB
      used: 524288, // 512 GB
      limit: 2097152, // 2 TB
    },
  },
  serversByType: [
    { type: "jupyterlab", count: 15 },
    { type: "rstudio", count: 5 },
    { type: "vscode", count: 8 },
    { type: "terminal", count: 2 },
  ],
  usageHistory: [
    {
      date: "2023-06-09",
      activeUsers: 12,
      activeServers: 15,
      cpuUsage: 28,
      memoryUsage: 62,
    },
    {
      date: "2023-06-10",
      activeUsers: 14,
      activeServers: 17,
      cpuUsage: 32,
      memoryUsage: 68,
    },
    {
      date: "2023-06-11",
      activeUsers: 10,
      activeServers: 12,
      cpuUsage: 25,
      memoryUsage: 55,
    },
    {
      date: "2023-06-12",
      activeUsers: 15,
      activeServers: 18,
      cpuUsage: 35,
      memoryUsage: 72,
    },
    {
      date: "2023-06-13",
      activeUsers: 16,
      activeServers: 20,
      cpuUsage: 38,
      memoryUsage: 75,
    },
    {
      date: "2023-06-14",
      activeUsers: 17,
      activeServers: 21,
      cpuUsage: 40,
      memoryUsage: 78,
    },
    {
      date: "2023-06-15",
      activeUsers: 18,
      activeServers: 22,
      cpuUsage: 42,
      memoryUsage: 82,
    },
  ],
};

/**
 * User profile structure
 */
export interface UserProfile {
  username: string;
  fullName: string;
  email: string;
  role: string;
  created: string;
  lastLogin: string;
  authMethod: string;
  apiToken: string;
  serverQuota: number;
  resourceLimits: {
    cpu: number;
    memory: number;
    storage: number;
  };
}

/**
 * Mock user profile for the currently logged in user
 */
export const MOCK_USER_PROFILE: UserProfile = {
  username: "johndoe",
  fullName: "John Doe",
  email: "john.doe@example.com",
  role: "admin",
  created: "2023-01-15T10:00:00Z",
  lastLogin: "2023-06-15T14:30:00Z",
  authMethod: "OAuth",
  apiToken: "d1e736787b0141069cc5ee7e310a76b6",
  serverQuota: 5,
  resourceLimits: {
    cpu: 8,
    memory: 16384,
    storage: 102400,
  },
};

/**
 * User preferences structure
 */
export interface UserPreferences {
  defaultServerType: ServerType;
  defaultImage: string;
  interfaceTheme: "light" | "dark" | "system";
  timeZone: string;
  startupNotebook: string | null;
  autoSaveInterval: number;
  terminalSettings: {
    fontFamily: string;
    fontSize: number;
    lineHeight: number;
  };
  editorSettings: {
    fontFamily: string;
    fontSize: number;
    tabSize: number;
    lineNumbers: boolean;
    wordWrap: boolean;
  };
}

/**
 * Mock user preferences
 */
export const MOCK_USER_PREFERENCES: UserPreferences = {
  defaultServerType: "jupyterlab",
  defaultImage: "jupyter/datascience-notebook:latest",
  interfaceTheme: "system",
  timeZone: "America/New_York",
  startupNotebook: "welcome.ipynb",
  autoSaveInterval: 120,
  terminalSettings: {
    fontFamily: "Menlo, monospace",
    fontSize: 12,
    lineHeight: 1.5,
  },
  editorSettings: {
    fontFamily: "Source Code Pro, monospace",
    fontSize: 14,
    tabSize: 4,
    lineNumbers: true,
    wordWrap: false,
  },
};
