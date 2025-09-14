// Mock version of jupyterHub.ts for UI testing

export interface ServerProgress {
  progress: number;
  failed: boolean | undefined;
  ready: boolean | undefined;
  message: string;
  html_message: string;
  url: string;
}

export interface ServerStatus {
  name: string;
  full_name?: string;
  ready: boolean;
  stopped: boolean;
  pending: "spawn" | "stop" | null;
  user_options?: JupyterHubServerOptions;
  url?: string;
  progress?: {
    message: string;
    percent: number;
  };
  last_activity?: string;
  started?: string | null;
  state?: {
    pod_name?: string;
  };
  progress_url?: string | null;
  full_url?: string | null;
  full_progress_url?: string | null;
}

export interface UserInfo {
  name: string;
  admin: boolean;
  servers: Record<string, ServerStatus>;
  groups: string[];
}

export interface ServerOptions {
  name?: string;
  image?: string;
  [key: string]: any;
}

export interface JupyterHubServerOptions {
  container_image: string;
  custom?: boolean;
  ssh: boolean;
  phome: string | "delete" | "remain";
  mountprojects: boolean;
  home: string | null;
  mounttostorage?: boolean;
  s3url?: string;
  s3bucket?: string;
  s3accesskey?: string;
  s3secretkey?: string;
  s3existing?: string;
  cpu: string;
  mem: string;
  gpu: string;
  migamount?: string;
  shmsize: string;
}

export interface ApiToken {
  id: string;
  user?: string;
  service?: string;
  token?: string;
  created: string;
  last_activity?: string;
  expires_at?: string | null;
  scopes: string[];
  note?: string;
}

// --- MOCK DATA ---

const mockServerStatus: ServerStatus = {
  name: "mock-server",
  ready: true,
  stopped: false,
  pending: null,
  url: "/user/mockuser/mock-server/",
  last_activity: new Date().toISOString(),
  started: new Date().toISOString(),
};

const mockUserInfo: UserInfo = {
  name: "mockuser",
  admin: false,
  servers: {
    "mock-server": mockServerStatus,
    "starting-server": { name: "starting-server", ready: false, stopped: false, pending: "spawn" },
    "another-server": {
      ...mockServerStatus,
      name: "another-server",
      ready: false,
      stopped: true,
      pending: null,
    },
  },
  groups: ["mockgroup"],
};

const mockApiTokens: ApiToken[] = [
  {
    id: "token-1",
    user: "mockuser",
    token: "mocktoken1",
    created: new Date().toISOString(),
    scopes: ["read:servers"],
    note: "Mock token 1 note",
  },
  {
    id: "token-2",
    user: "mockuser",
    token: "mocktoken2",
    created: new Date().toISOString(),
    scopes: ["access:all"],
    note: "Mock token 2 note",
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Expires in 7 days
  },
];

// --- MOCK FUNCTIONS ---

export async function getUserNamedNotebooks(username?: string): Promise<Record<string, ServerStatus>> {
  // Return only named servers (exclude default/empty name)
  return Object.fromEntries(
    Object.entries(mockUserInfo.servers).filter(([name]) => name !== "")
  );
}

export async function getServerStatus(serverName: string, username?: string): Promise<ServerStatus> {
  return mockUserInfo.servers[serverName] || { ...mockServerStatus, name: serverName };
}

export async function getServerStatusQuery(serverName: string): Promise<ServerStatus> {
  return getServerStatus(serverName);
}

export async function fetchServerProgress(serverName: string, username?: string): Promise<ServerProgress> {
  return {
    progress: 100,
    failed: false,
    ready: true,
    message: "Server ready",
    html_message: "<b>Server ready</b>",
    url: `/user/mockuser/${serverName}/`,
  };
}

export async function startServer(serverName: string, options?: ServerOptions, username?: string): Promise<void> {
  // No-op for mock
  return;
}

export async function createServer(serverName: string, options: JupyterHubServerOptions, username?: string): Promise<void> {
  // No-op for mock
  return;
}

export async function createDefaultServer(serverName: string, username?: string): Promise<void> {
  // No-op for mock
  return;
}

export async function stopServer(serverName: string, username?: string): Promise<void> {
  // No-op for mock
  return;
}

export async function deleteServer(serverName: string, username?: string): Promise<void> {
  // No-op for mock
  return;
}

export function formatTimeAgo(date: Date | string): string {
  return "Just now (mock)";
}

export async function getUserTokens(username?: string): Promise<ApiToken[]> {
  return mockApiTokens;
}

export async function createUserToken(
  options: {
    name?: string;
    note?: string;
    expires_in?: string | number;
    scopes?: string[];
  },
  username?: string,
): Promise<ApiToken> {
  return {
    id: "token-mock",
    user: "mockuser",
    token: "mocktoken",
    created: new Date().toISOString(),
    scopes: options.scopes || [],
    note: options.note || "Mock token",
  };
}

export async function deleteUserToken(tokenId: string, username?: string): Promise<void> {
  // No-op for mock
  return;
}

export async function getRecentNotebooks(limit: number = 3, username?: string): Promise<Record<string, ServerStatus>> {
  // Return up to `limit` servers
  const servers = Object.entries(mockUserInfo.servers)
    .slice(0, limit)
    .reduce((acc, [name, server]) => {
      acc[name] = server;
      return acc;
    }, {} as Record<string, ServerStatus>);
  return servers;
}

export function transformOptionsToServerFormat(options: {
  image: string;
  sshCheck?: boolean;
  phselection: string;
  phname?: string;
  phCheck?: boolean;
  projectCheck?: boolean;
  storageCheck?: boolean;
  home?: string;
  locationStorageCheck?: boolean;
  s3check?: boolean;
  s3selection?: string;
  s3name?: string;
  s3url?: string;
  s3bucket?: string;
  s3accesskey?: string;
  s3secretkey?: string;
  cpuselection: string;
  memselection: string;
  gpuselection: string;
  migamount?: string;
}): JupyterHubServerOptions {
  // Return a simple mock transformation
  return {
    container_image: options.image,
    ssh: !!options.sshCheck,
    phome: options.phselection,
    mountprojects: !!options.projectCheck,
    home: options.home || null,
    cpu: options.cpuselection,
    mem: options.memselection,
    gpu: options.gpuselection,
    shmsize: options.memselection,
  };
}
